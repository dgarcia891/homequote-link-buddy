const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const respond = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const { action, title, content, selectedText, tone } = await req.json();

    const systemPrompts: Record<string, string> = {
      generate_intro: "You are a professional blog writer for a home services company. Write a compelling introduction paragraph for a blog post. Return only the HTML paragraph(s), no markdown.",
      generate_outline: "You are a professional blog writer. Generate a detailed outline for a blog post as an HTML ordered list with nested items. Return only the HTML.",
      rewrite: `You are a professional editor. Rewrite the given text${tone ? ` in a ${tone} tone` : ''}. Return only the rewritten HTML, no markdown.`,
      summarize: "You are a professional editor. Summarize the given text into 2-3 concise sentences. Return only HTML paragraphs.",
      seo_suggest: "You are an SEO expert. Based on the given content, suggest an optimized page title (under 60 chars) and meta description (under 160 chars). Return as JSON with keys 'title' and 'description'.",
    };

    const systemPrompt = systemPrompts[action];
    if (!systemPrompt) return respond({ error: `Unknown action: ${action}` }, 400);

    let userMessage = '';
    if (action === 'generate_intro' || action === 'generate_outline') {
      userMessage = `Blog post title: "${title || 'Untitled'}"`;
    } else if (action === 'rewrite' || action === 'summarize') {
      userMessage = selectedText || content || '';
      if (!userMessage) return respond({ error: 'No text provided to process' }, 400);
    } else if (action === 'seo_suggest') {
      userMessage = `Title: ${title || ''}\n\nContent:\n${(content || '').slice(0, 3000)}`;
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) return respond({ error: 'Rate limit exceeded. Please try again in a moment.' }, 429);
      if (aiResponse.status === 402) return respond({ error: 'AI credits exhausted. Please add funds.' }, 402);
      const errText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errText);
      return respond({ error: 'AI service error' }, 500);
    }

    const data = await aiResponse.json();
    const result = data.choices?.[0]?.message?.content || '';

    if (action === 'seo_suggest') {
      try {
        // Try to parse as JSON
        const cleaned = result.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return respond({ success: true, result: parsed });
      } catch {
        return respond({ success: true, result: { title: '', description: result } });
      }
    }

    return respond({ success: true, result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ai-writer]', msg);
    return respond({ error: msg }, 500);
  }
});
