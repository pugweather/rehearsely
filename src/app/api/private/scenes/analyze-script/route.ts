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
          content: `You are a script analysis expert. Analyze the provided script and extract character names and dialogue that actors will speak aloud.

CRITICAL: Extract ONLY the words that would be spoken out loud by actors. Remove ALL stage directions and actions.

CHARACTER NAMES:
- Keep original case (usually ALL CAPS in scripts)
- Merge variations/typos (e.g., "HAMLET", "Hamlet", "HAMLEt" → "HAMLET")
- Fix obvious OCR errors in names

DIALOGUE EXTRACTION:
1. REMOVE stage directions completely:
   - Parenthetical actions: (POINTS TO HERSELF), (laughs), (to John), (exits)
   - Quoted references: ("CONFUCIOUS"), ("INSERT QUOTE")
   - Any non-spoken instructions in parentheses or brackets

2. CLEAN the dialogue text:
   - Fix obvious typos (e.g., "favorite fay" → "favorite day")
   - Keep natural speech patterns and intentional grammar
   - Only fix clear errors that would confuse an actor

3. ONLY include words an actor speaks into the microphone:
   - YES: "Connelly, remember, you're the student and I'm the teacher. Sometimes the lesson isn't learned until well after the lesson is taught."
   - NO: "Connelly, remember, you're the student and I'm the teacher. ("CONFUCIOUS") Sometimes the lesson isn't learned until well after the lesson is taught."

   - YES: "Didn't you hear Miranda? If we don't hit the quota someone's getting fired, and you know who that's going to be? The new person."
   - NO: "Didn't you hear Miranda? If we don't hit the quota someone's getting fired, and you know who that's going to be...? (POINTS TO HERSELF) The new person."

RETURN FORMAT (valid JSON):
{
  "characters": ["CHARACTER1", "CHARACTER2", ...],
  "dialogue": [
    {
      "character": "CHARACTER1",
      "text": "Only the spoken words, typos fixed, stage directions removed",
      "line_number": 1
    }
  ]
}

Remember: Actors read this in the teleprompter. They never say stage directions out loud!`
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

    // Check if the parsed result looks like a valid scene script
    // A valid script should have at least one character and one line of dialogue
    const hasCharacters = analysis.characters && Array.isArray(analysis.characters) && analysis.characters.length > 0
    const hasDialogue = analysis.dialogue && Array.isArray(analysis.dialogue) && analysis.dialogue.length > 0

    if (!hasCharacters || !hasDialogue) {
      console.log('Script does not appear to be a valid scene (no characters or dialogue found)')
      return NextResponse.json({
        success: false,
        error: 'unparseable',
        message: 'This PDF doesn\'t appear to be a scene script. We couldn\'t find any characters or dialogue!'
      }, { status: 422 })
    }

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
