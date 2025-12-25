import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { extractCausalGraph, CausalGraph } from '@/services/causalGraphService';

export default function GraphScreen() {
  const params = useLocalSearchParams();
  const [graph, setGraph] = useState<CausalGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
        setLoading(false);
      } catch (err) {
        console.error('Error loading graph:', err);
        setError(err instanceof Error ? err.message : 'Failed to load graph');
        setLoading(false);
      }
    }

    loadGraph();
  }, [params.text, params.apiKey]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#367AFF" />
        <Text style={styles.loadingText}>Analyzing causal relationships...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Error</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
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

  // Create HTML content with D3.js force-directed graph
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background-color: #F9F8F8;
      overflow: hidden;
      touch-action: none;
    }
    #graph {
      width: 100vw;
      height: 100vh;
    }
    .node {
      cursor: pointer;
    }
    .node rect {
      fill: #367AFF;
      stroke: #FFFFFF;
      stroke-width: 2px;
      rx: 8;
    }
    .node.selected rect {
      fill: #2B5FCC;
      stroke: #FFD700;
      stroke-width: 3px;
    }
    .node text {
      fill: #FFFFFF;
      font-size: 14px;
      font-family: 'IBM Plex Serif', serif;
      pointer-events: none;
      user-select: none;
      text-anchor: middle;
      dominant-baseline: middle;
    }
    .link {
      stroke: #367AFF;
      stroke-width: 2px;
      fill: none;
      marker-end: url(#arrowhead);
    }
  </style>
</head>
<body>
  <svg id="graph"></svg>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <script>
    const graphData = ${JSON.stringify(graph)};

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select('#graph')
      .attr('width', width)
      .attr('height', height);

    // Define arrow marker
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#367AFF');

    // Create links
    const links = graphData.edges.map(e => ({
      source: e.from,
      target: e.to
    }));

    // Create nodes
    const nodes = graphData.nodes.map(n => ({
      id: n.id,
      label: n.label
    }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Create link elements
    const link = svg.append('g')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('class', 'link');

    // Create node groups
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', function(event, d) {
        event.stopPropagation();
        d3.selectAll('.node').classed('selected', false);
        d3.select(this).classed('selected', true);
      });

    // Add rectangles to nodes
    node.each(function(d) {
      const padding = 16;
      const charWidth = 7;
      const rectWidth = Math.max(d.label.length * charWidth + padding * 2, 80);
      const rectHeight = 40;

      d.width = rectWidth;
      d.height = rectHeight;

      d3.select(this).append('rect')
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .attr('x', -rectWidth / 2)
        .attr('y', -rectHeight / 2);

      d3.select(this).append('text')
        .text(d.label)
        .attr('dy', '0.35em');
    });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link.attr('d', d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);

        // Calculate the point on the edge of the target rectangle
        const targetPadding = 20;
        const ratio = (dr - targetPadding) / dr;
        const endX = d.source.x + dx * ratio;
        const endY = d.source.y + dy * ratio;

        return \`M\${d.source.x},\${d.source.y}L\${endX},\${endY}\`;
      });

      node.attr('transform', d => \`translate(\${d.x},\${d.y})\`);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Deselect on background click
    svg.on('click', () => {
      d3.selectAll('.node').classed('selected', false);
    });
  </script>
</body>
</html>
  `;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Causal Graph</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F8F8',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F9F8F8',
    justifyContent: 'center',
    alignItems: 'center',
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
  webview: {
    flex: 1,
    backgroundColor: '#F9F8F8',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 20,
  },
});
