
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { 
  collection, doc, addDoc, updateDoc, getDoc, 
  query, where, getDocs, orderBy, limit, increment, arrayUnion 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { Order, OrderStatus, StatusHistoryItem, Courier, UserRole } from '../types';

/**
 * Strict validation for order status transitions
 */
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.DRAFT]: [OrderStatus.PENDING, OrderStatus.CANCELLED],
  [OrderStatus.PENDING]: [OrderStatus.ASSIGNED, OrderStatus.CANCELLED],
  [OrderStatus.ASSIGNED]: [OrderStatus.PICKED, OrderStatus.CANCELLED],
  [OrderStatus.PICKED]: [OrderStatus.IN_DELIVERY, OrderStatus.CANCELLED],
  [OrderStatus.IN_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: []
};

/**
 * Validates if a status transition is allowed
 */
export const isValidTransition = (currentStatus: OrderStatus, nextStatus: OrderStatus): boolean => {
  if (currentStatus === nextStatus) return true;
  return VALID_TRANSITIONS[currentStatus]?.includes(nextStatus) || false;
};

/**
 * Creates a new order in Firestore
 */
export const createOrder = async (orderData: Partial<Order>): Promise<string> => {
  try {
    const timestamp = Date.now();
    const initialStatus = OrderStatus.PENDING;
    
    const newOrder: Partial<Order> = {
      ...orderData,
      status: initialStatus,
      createdAt: timestamp,
      updatedAt: timestamp,
      statusHistory: [{
        status: initialStatus,
        changedAt: timestamp,
        changedBy: orderData.customerId || 'SYSTEM'
      }]
    };

    const docRef = await addDoc(collection(db, 'orders'), newOrder);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'orders');
    return '';
  }
};

/**
 * Assigns an order to a specific courier
 */
export const assignOrder = async (orderId: string, courierId: string, adminId: string): Promise<void> => {
  try {
    const timestamp = Date.now();
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) throw new Error('Order not found');
    const order = orderSnap.data() as Order;

    if (order.status !== OrderStatus.PENDING) {
      throw new Error('Order must be in PENDING status to be assigned');
    }

    const statusHistoryItem: StatusHistoryItem = {
      status: OrderStatus.ASSIGNED,
      changedAt: timestamp,
      changedBy: adminId
    };

    await updateDoc(orderRef, {
      status: OrderStatus.ASSIGNED,
      assignedTo: courierId,
      driverId: courierId, // Mapping for backward compatibility if needed
      updatedAt: timestamp,
      statusHistory: arrayUnion(statusHistoryItem)
    });

    // Update courier workload
    const courierQuery = query(collection(db, 'couriers'), where('userId', '==', courierId), limit(1));
    const courierDocs = await getDocs(courierQuery);
    if (!courierDocs.empty) {
      await updateDoc(courierDocs.docs[0].ref, {
        currentOrdersCount: increment(1)
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
};

/**
 * Updates the status of an order with validation
 */
export const updateOrderStatus = async (
  orderId: string, 
  newStatus: OrderStatus, 
  userId: string,
  userRole: UserRole
): Promise<void> => {
  try {
    const timestamp = Date.now();
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) throw new Error('Order not found');
    const order = orderSnap.data() as Order;

    // Access Control
    if (userRole === 'CUSTOMER' && order.customerId !== userId) {
      throw new Error('Unauthorized');
    }
    if (userRole === 'DRIVER' && (order.assignedTo !== userId && order.driverId !== userId)) {
      throw new Error('Unauthorized');
    }

    // Lifecycle Validation
    if (!isValidTransition(order.status, newStatus)) {
      throw new Error(`Invalid transition from ${order.status} to ${newStatus}`);
    }

    const statusHistoryItem: StatusHistoryItem = {
      status: newStatus,
      changedAt: timestamp,
      changedBy: userId
    };

    const updates: any = {
      status: newStatus,
      updatedAt: timestamp,
      statusHistory: arrayUnion(statusHistoryItem)
    };

    // If delivered or cancelled, decrement courier workload
    if ((newStatus === OrderStatus.DELIVERED || newStatus === OrderStatus.CANCELLED) && order.assignedTo) {
      const courierQuery = query(collection(db, 'couriers'), where('userId', '==', order.assignedTo), limit(1));
      const courierDocs = await getDocs(courierQuery);
      if (!courierDocs.empty) {
        await updateDoc(courierDocs.docs[0].ref, {
          currentOrdersCount: increment(-1)
        });
      }
    }

    await updateDoc(orderRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
};

/**
 * Automatically assigns an order to the courier with the lowest workload
 */
export const autoAssignOrder = async (orderId: string): Promise<string | null> => {
  try {
    const couriersRef = collection(db, 'couriers');
    const q = query(
      couriersRef, 
      where('isActive', '==', true), 
      orderBy('currentOrdersCount', 'asc'), 
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    const bestCourier = querySnapshot.docs[0].data() as Courier;
    await assignOrder(orderId, bestCourier.userId, 'SYSTEM');
    return bestCourier.userId;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'couriers');
    return null;
  }
};
