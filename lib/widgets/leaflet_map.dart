import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' as ll;

import '../theme/app_colors.dart';

/// نسخة Flutter من إعداد خريطة Leaflet المستخدم في نسخة الويب:
/// نفس التايل سيرفر (CartoDB light_all) بنفس الأسلوب.
class WasalhaMap extends StatefulWidget {
  final ll.LatLng center;
  final double zoom;
  final List<Marker> markers;
  final List<ll.LatLng> routeGeometry; // [lat, lng] نفس الأصل
  final List<ll.LatLng>? fitPoints; // مكافئ MapAutoFit
  const WasalhaMap({
    super.key,
    required this.center,
    this.zoom = 15,
    this.markers = const [],
    this.routeGeometry = const [],
    this.fitPoints,
  });

  @override
  State<WasalhaMap> createState() => _WasalhaMapState();
}

class _WasalhaMapState extends State<WasalhaMap> {
  final MapController _controller = MapController();
  bool _fitted = false;

  @override
  void didUpdateWidget(covariant WasalhaMap old) {
    super.didUpdateWidget(old);
    _tryFit();
  }

  void _tryFit() {
    final pts = widget.fitPoints;
    if (pts == null || pts.length < 2) return;
    try {
      final bounds = ll.LatLngBounds.fromPoints(pts);
      _controller.fitCamera(
        CameraFit.bounds(
          bounds: bounds,
          padding: const EdgeInsets.all(50),
        ),
      );
    } catch (_) {
      // الخريطة لسه مش جاهزة، هتتظبط في الفريم الجاي
    }
  }

  @override
  Widget build(BuildContext context) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_fitted) {
        _fitted = true;
        _tryFit();
      }
    });
    return FlutterMap(
      mapController: _controller,
      options: MapOptions(
        initialCenter: widget.center,
        initialZoom: widget.zoom,
        interactionOptions: const InteractionOptions(
          flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
        ),
      ),
      children: [
        TileLayer(
          urlTemplate:
              'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          subdomains: const ['a', 'b', 'c', 'd'],
          userAgentPackageName: 'com.wasalha.app',
        ),
        if (widget.routeGeometry.length > 1)
          PolylineLayer(polylines: [
            Polyline(
              points: widget.routeGeometry,
              color: C.emerald500.withOpacity(0.6),
              strokeWidth: 6,
            ),
          ]),
        MarkerLayer(markers: widget.markers),
      ],
    );
  }
}

/// أيقونة الكابتن (🛵) — مكافئ driverIcon في CustomerDashboard.tsx
Marker driverMarker(ll.LatLng point) {
  return Marker(
    point: point,
    width: 48,
    height: 48,
    child: Stack(
      alignment: Alignment.center,
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
              color: C.emerald500.withOpacity(0.20), shape: BoxShape.circle),
        ),
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: C.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: C.emerald500, width: 2),
            boxShadow: const [
              BoxShadow(color: Color(0x40000000), blurRadius: 20, offset: Offset(0, 10)),
            ],
          ),
          child: const Text('🛵', style: TextStyle(fontSize: 16, height: 1)),
        ),
        Positioned(
          bottom: -1,
          child: Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: C.emerald600,
              shape: BoxShape.circle,
              border: Border.all(color: C.white, width: 2),
            ),
          ),
        ),
      ],
    ),
  );
}

/// أيقونة بيت العميل (🏠) — مكافئ customerHomeIcon
Marker customerHomeMarker(ll.LatLng point) => Marker(
      point: point,
      width: 45,
      height: 45,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: C.white,
          shape: BoxShape.circle,
          border: Border.all(color: C.blue600, width: 4),
          boxShadow: const [
            BoxShadow(color: Color(0x40000000), blurRadius: 20, offset: Offset(0, 8)),
          ],
        ),
        child: const Center(child: Text('🏠', style: TextStyle(fontSize: 16))),
      ),
    );

/// أيقونة نقطة الاستلام (🏪) — مكافئ pickupPointIcon
Marker pickupPointMarker(ll.LatLng point) => Marker(
      point: point,
      width: 45,
      height: 45,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: C.white,
          shape: BoxShape.circle,
          border: Border.all(color: C.rose500, width: 4),
          boxShadow: [Sh_ring],
        ),
        child: const Center(child: Text('🏪', style: TextStyle(fontSize: 16))),
      ),
    );

const Sh_ring = BoxShadow(color: Color(0x40000000), blurRadius: 20, offset: Offset(0, 8));
