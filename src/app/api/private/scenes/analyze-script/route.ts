import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { scriptText } = await request.json()

    if (!scriptText) {
      return NextResponse.json(
        { error: 'Script text is required' },
        { status: 400 }
      )
    }

    console.log('Analyzing script with OpenAI...')

    // Use GPT-4 to analyze the script
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using mini for speed and cost efficiency
      messages: [
        {
          role: 'system',
          content: `You are a script analysis expert. Analyze the provided script and extract:
1. A list of all character names that appear in the script
2. For each line of dialogue, identify which character is speaking

Handle typos and variations in character names (e.g., "HAMLET" vs "Hamlet" vs "HAMLEt" should all be treated as the same character).

Return your analysis in valid JSON format with this structure:
{
  "characters": ["Character1", "Character2", ...],
  "dialogue": [
    {
      "character": "Character1",
      "text": "The actual dialogue text",
      "line_number": 1
    },
    ...
  ]
}

Important:
- Normalize all character names to proper case (first letter uppercase, rest lowercase)
- Combine duplicate characters (handle typos/variations)
- Only include actual dialogue (no stage directions unless they're part of the dialogue)
- Preserve the original dialogue text exactly as written
- Number lines sequentially starting from 1`
        },
        {
          role: 'user',
          content: `Analyze this script:\n\n${scriptText}`
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent results
      response_format: { type: 'json_object' }
    })

    const analysisText = completion.choices[0].message.content
    if (!analysisText) {
      throw new Error('No response from OpenAI')
    }

    const analysis = JSON.parse(analysisText)

    console.log('Script analysis complete:')
    console.log('Characters found:', analysis.characters)
    console.log('Dialogue lines:', analysis.dialogue?.length || 0)

    return NextResponse.json({
      success: true,
      analysis
    })

  } catch (error: any) {
    console.error('Error analyzing script:', error)
    return NextResponse.json(
      { error: 'Failed to analyze script', details: error.message },
      { status: 500 }
    )
  }
}
