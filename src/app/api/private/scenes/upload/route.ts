import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../../../utils/supabase/server'
import db from '@/app/database'
import { scenes, characters, lines } from '@/database/drizzle/schema'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, fileName, characters: characterAssignments, dialogue: dialogueData } = body

    console.log('Upload request received:', { name, fileName, characterCount: characterAssignments?.length, dialogueCount: dialogueData?.length })

    if (!name || !characterAssignments || !Array.isArray(characterAssignments)) {
      return NextResponse.json(
        { error: 'Missing required fields: name or characters' },
        { status: 400 }
      )
    }

    if (!dialogueData || !Array.isArray(dialogueData)) {
      return NextResponse.json(
        { error: 'Missing dialogue data' },
        { status: 400 }
      )
    }

    // Step 1: Create the scene
    const insertedScene = await db.insert(scenes).values({
      name,
      user_id: user.id
    }).returning()

    const sceneId = insertedScene[0]?.id

    if (!sceneId) {
      throw new Error('Failed to create scene')
    }

    console.log(`Created scene ${sceneId}`)

    // Step 2: Create characters with voice_id
    const characterMap = new Map<string, { id: number, voiceId: string | null, isMe: boolean }>()
    const myCharacterName = characterAssignments.find(c => c.isMe)?.name

    for (const char of characterAssignments) {
      // Note: voice_id in schema, but we receive selectedVoice from frontend
      const insertedChar = await db.insert(characters).values({
        name: char.name,
        scene_id: sceneId,
        voice_id: char.selectedVoice || null, // Changed from voice_name to voice_id
        is_me: char.isMe
      }).returning()

      if (insertedChar[0]?.id) {
        characterMap.set(char.name.toLowerCase(), {
          id: insertedChar[0].id,
          voiceId: char.selectedVoice || null,
          isMe: char.isMe
        })
        console.log(`Created character: ${char.name} (ID: ${insertedChar[0].id})`)
      }
    }

    // Step 3: Create lines with required fields
    const createdLines = []
    const linesNeedingAudio = []

    for (const dialogueLine of dialogueData) {
      const charData = characterMap.get(dialogueLine.character.toLowerCase())

      if (!charData) {
        console.warn(`Character not found for line: ${dialogueLine.character}`)
        continue
      }

      const isMyLine = charData.isMe

      const insertedLine = await db.insert(lines).values({
        text: dialogueLine.text,
        character_id: charData.id,
        scene_id: sceneId,
        order: dialogueLine.line_number,
        audio_url: null, // Will be generated for non-me characters
        speed: 1, // Default speed
        delay: 1, // Default delay
        is_voice_cloned: false
      }).returning()

      if (insertedLine[0]) {
        createdLines.push(insertedLine[0])

        // Track lines that need audio generation (non-me characters with voices)
        if (!isMyLine && charData.voiceId) {
          linesNeedingAudio.push({
            lineId: insertedLine[0].id,
            text: dialogueLine.text,
            characterName: dialogueLine.character,
            voiceId: charData.voiceId
          })
        }
      }
    }

    console.log(`Created ${createdLines.length} lines, ${linesNeedingAudio.length} need audio`)

    return NextResponse.json({
      success: true,
      sceneId,
      linesNeedingAudio
    })

  } catch (error: any) {
    console.error('Error creating scene from upload:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Failed to create scene', details: error.message },
      { status: 500 }
    )
  }
}
