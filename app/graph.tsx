import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IBMPlexSerif_400Regular, useFonts } from '@expo-google-fonts/ibm-plex-serif';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { extractCausalGraph, CausalGraph, GraphNode } from '@/services/causalGraphService';

const { width, height } = Dimensions.get('window');
const centerX = width / 2;
const centerY = height / 2 - 100;

export default function GraphScreen() {
  const params = useLocalSearchParams();
  const [graph, setGraph] = useState<CausalGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<{ [key: string]: { x: number; y: number } }>({});
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    IBMPlexSerif_400Regular,
  });

  useEffect(() => {
    async function loadGraph() {
      try {
        const text = params.text as string;
        const apiKey = params.apiKey as string;

        if (!text || !apiKey) {
          setError('Missing text or API key');
          setLoading(false);
          return;
        }

        const causalGraph = await extractCausalGraph(text, apiKey);
        setGraph(causalGraph);

        // Initialize node positions
        const positions: { [key: string]: { x: number; y: number } } = {};
        causalGraph.nodes.forEach((node) => {
          positions[node.id] = { x: centerX + node.x, y: centerY + node.y };
        });
        setNodePositions(positions);

        setLoading(false);
      } catch (err) {
        console.error('Error loading graph:', err);
        setError(err instanceof Error ? err.message : 'Failed to load graph');
        setLoading(false);
      }
    }

    loadGraph();
  }, [params.text, params.apiKey]);

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#367AFF" />
        <Text style={styles.loadingText}>Analyzing causal relationships...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!graph) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No graph data</Text>
      </View>
    );
  }

  const handleNodeDrag = (nodeId: string, newX: number, newY: number) => {
    setNodePositions((prev) => ({
      ...prev,
      [nodeId]: { x: newX, y: newY },
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Causal Graph</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.graphContainer}>
        <Svg width={width} height={height - 150}>
          {/* Draw edges first so they appear behind nodes */}
          {graph.edges.map((edge, index) => {
            const fromPos = nodePositions[edge.from];
            const toPos = nodePositions[edge.to];

            if (!fromPos || !toPos) return null;

            // Calculate arrow direction
            const dx = toPos.x - fromPos.x;
            const dy = toPos.y - fromPos.y;
            const angle = Math.atan2(dy, dx);
            const nodeRadius = 30;

            // Adjust line endpoints to stop at node edges
            const fromX = fromPos.x + Math.cos(angle) * nodeRadius;
            const fromY = fromPos.y + Math.sin(angle) * nodeRadius;
            const toX = toPos.x - Math.cos(angle) * nodeRadius;
            const toY = toPos.y - Math.sin(angle) * nodeRadius;

            // Arrow head
            const arrowSize = 10;
            const arrowAngle1 = angle + Math.PI - Math.PI / 6;
            const arrowAngle2 = angle + Math.PI + Math.PI / 6;

            return (
              <G key={`edge-${index}`}>
                <Line
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke="#367AFF"
                  strokeWidth="2"
                />
                {/* Arrow head */}
                <Line
                  x1={toX}
                  y1={toY}
                  x2={toX + Math.cos(arrowAngle1) * arrowSize}
                  y2={toY + Math.sin(arrowAngle1) * arrowSize}
                  stroke="#367AFF"
                  strokeWidth="2"
                />
                <Line
                  x1={toX}
                  y1={toY}
                  x2={toX + Math.cos(arrowAngle2) * arrowSize}
                  y2={toY + Math.sin(arrowAngle2) * arrowSize}
                  stroke="#367AFF"
                  strokeWidth="2"
                />
              </G>
            );
          })}

          {/* Draw nodes */}
          {graph.nodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            return (
              <DraggableNode
                key={node.id}
                node={node}
                x={pos.x}
                y={pos.y}
                onDrag={(newX, newY) => handleNodeDrag(node.id, newX, newY)}
              />
            );
          })}
        </Svg>
      </View>
    </View>
  );
}

interface DraggableNodeProps {
  node: GraphNode;
  x: number;
  y: number;
  onDrag: (x: number, y: number) => void;
}

function DraggableNode({ node, x, y, onDrag }: DraggableNodeProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(x);
  const startY = useSharedValue(y);

  const gesture = Gesture.Pan()
    .onStart(() => {
      startX.value = x;
      startY.value = y;
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      const newX = startX.value + translateX.value;
      const newY = startY.value + translateY.value;
      onDrag(newX, newY);
      translateX.value = 0;
      translateY.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[{ position: 'absolute', left: x - 30, top: y - 30 }, animatedStyle]}>
        <Svg width={60} height={60}>
          <Circle cx={30} cy={30} r={28} fill="#367AFF" stroke="#FFFFFF" strokeWidth="2" />
          <SvgText
            x={30}
            y={35}
            fontSize="12"
            fontWeight="bold"
            fill="#FFFFFF"
            textAnchor="middle"
          >
            {node.label.length > 10 ? node.label.substring(0, 8) + '...' : node.label}
          </SvgText>
        </Svg>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontFamily: 'IBMPlexSerif_400Regular',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  backButton: {
    backgroundColor: '#367AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  graphContainer: {
    flex: 1,
    backgroundColor: '#F9F8F8',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#367AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
