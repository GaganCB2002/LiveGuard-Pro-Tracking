import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isTracking = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('LiveGuard'),
        actions: [
          Switch(value: _isTracking, onChanged: (v) => setState(() => _isTracking = v)),
        ],
      ),
      body: const GoogleMap(
        initialCameraPosition: CameraPosition(target: LatLng(40.7128, -74.0060), zoom: 14),
        myLocationEnabled: true,
        myLocationButtonEnabled: true,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        backgroundColor: Colors.red,
        icon: const Icon(Icons.emergency),
        label: const Text('SOS'),
      ),
    );
  }
}
