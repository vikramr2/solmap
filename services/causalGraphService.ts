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
  const prompt = `You are helping someone understand their emotions by mapping the causal relationships in their thoughts and feelings.

Text: "${text}"

Think through this step-by-step:

1. First, identify the emotions, feelings, and emotional states expressed (both explicit and implicit)
2. Then, identify the events, situations, people, thoughts, or behaviors mentioned
3. Analyze the causal connections: what leads to what? Consider:
   - Direct causes (X makes me feel Y)
   - Indirect causes (X leads to Y which makes me feel Z)
   - Cyclical patterns (X causes Y which reinforces X)
   - Hidden emotional drivers (what might be underlying the surface emotions?)
4. Look for emotional complexity:
   - Conflicting feelings
   - Layered emotions (surface emotion vs deeper emotion)
   - Triggers and responses
   - Coping mechanisms and their effects

Now extract these as a causal graph. Use clear, emotionally-aware labels for nodes. Capture both obvious and subtle relationships.

Return ONLY a valid JSON object in this exact format:
{
  "nodes": [
    {"id": "unique_id", "label": "concise label"}
  ],
  "edges": [
    {"from": "source_id", "to": "target_id"}
  ]
}

Example 1 - "I avoid social events because I'm afraid of being judged, but then I feel lonely":
{
  "nodes": [
    {"id": "fear_judgment", "label": "fear of judgment"},
    {"id": "avoid_social", "label": "avoiding people"},
    {"id": "loneliness", "label": "loneliness"},
    {"id": "isolation", "label": "isolation"}
  ],
  "edges": [
    {"from": "fear_judgment", "to": "avoid_social"},
    {"from": "avoid_social", "to": "isolation"},
    {"from": "isolation", "to": "loneliness"},
    {"from": "loneliness", "to": "fear_judgment"}
  ]
}

Example 2 - "work makes me anxious":
{
  "nodes": [
    {"id": "work", "label": "work"},
    {"id": "anxiety", "label": "anxiety"}
  ],
  "edges": [
    {"from": "work", "to": "anxiety"}
  ]
}

Be concise but emotionally precise with labels. Reveal the emotional architecture of the text.`;

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
