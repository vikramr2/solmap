export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
}

export interface CausalGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export async function extractCausalGraph(text: string, apiKey: string): Promise<CausalGraph> {
  const prompt = `Extract all causal relationships from the following text and return them as a JSON object.

Text: "${text}"

Please identify:
1. All entities/concepts mentioned (these will be nodes)
2. All causal relationships between them (these will be edges)

Return ONLY a valid JSON object in this exact format, with no other text:
{
  "nodes": [
    {"id": "unique_id", "label": "entity name"}
  ],
  "edges": [
    {"from": "source_id", "to": "target_id"}
  ]
}

For example, for "work makes me anxious", return:
{
  "nodes": [
    {"id": "work", "label": "work"},
    {"id": "anxiety", "label": "anxiety"}
  ],
  "edges": [
    {"from": "work", "to": "anxiety"}
  ]
}

Extract implicit and explicit causal relationships. Be concise with node labels.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API request failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  const responseText = data.content[0].type === 'text' ? data.content[0].text : '';

  // Parse the JSON response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract JSON from Claude response');
  }

  const graphData = JSON.parse(jsonMatch[0]);

  // Add positions to nodes in a circle layout
  const nodes: GraphNode[] = graphData.nodes.map((node: any, index: number) => {
    const angle = (index / graphData.nodes.length) * 2 * Math.PI;
    const radius = 100;
    return {
      id: node.id,
      label: node.label,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  });

  return {
    nodes,
    edges: graphData.edges,
  };
}
