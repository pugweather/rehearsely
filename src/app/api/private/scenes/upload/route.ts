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
    const { name, fileName, characters: characterAssignments } = body

    if (!name || !characterAssignments || !Array.isArray(characterAssignments)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get dialogue data from sessionStorage (will be passed by client)
    // For now, we'll expect it in the request body
    const dialogueData = body.dialogue

    if (!dialogueData || !Array.isArray(dialogueData)) {
      return NextResponse.json(
        { error: 'Missing dialogue data' },
        { status: 400 }
      )
    }

    // Create the scene
    const insertedScene = await db.insert(scenes).values({
      name,
      user_id: user.id
    }).returning()

    const sceneId = insertedScene[0]?.id

    if (!sceneId) {
      throw new Error('Failed to create scene')
    }

    // Create characters
    const characterMap = new Map<string, number>() // character name -> character id
    const myCharacterName = characterAssignments.find(c => c.isMe)?.name

    for (const char of characterAssignments) {
      const insertedChar = await db.insert(characters).values({
        name: char.name,
        scene_id: sceneId,
        voice_name: char.selectedVoice || null,
        is_me: char.isMe
      }).returning()

      if (insertedChar[0]?.id) {
        characterMap.set(char.name.toLowerCase(), insertedChar[0].id)
      }
    }

    // Create lines from dialogue data
    const createdLines = []

    for (const dialogueLine of dialogueData) {
      const characterId = characterMap.get(dialogueLine.character.toLowerCase())

      if (!characterId) {
        console.warn(`Character not found for line: ${dialogueLine.character}`)
        continue
      }

      const isMyLine = dialogueLine.character.toLowerCase() === myCharacterName?.toLowerCase()

      const insertedLine = await db.insert(lines).values({
        text: dialogueLine.text,
        character_id: characterId,
        scene_id: sceneId,
        order: dialogueLine.line_number,
        is_saved: isMyLine, // My lines are immediately saved
        audio_url: null // Will be generated for non-me characters
      }).returning()

      if (insertedLine[0]) {
        createdLines.push({
          ...insertedLine[0],
          characterName: dialogueLine.character,
          needsAudio: !isMyLine
        })
      }
    }

    console.log(`Created scene ${sceneId} with ${createdLines.length} lines`)

    return NextResponse.json({
      success: true,
      sceneId,
      linesNeedingAudio: createdLines.filter(l => l.needsAudio).map(l => ({
        lineId: l.id,
        text: l.text,
        characterName: l.characterName,
        voiceName: characterAssignments.find(c =>
          c.name.toLowerCase() === l.characterName.toLowerCase()
        )?.selectedVoice
      }))
    })

  } catch (error: any) {
    console.error('Error creating scene from upload:', error)
    return NextResponse.json(
      { error: 'Failed to create scene', details: error.message },
      { status: 500 }
    )
  }
}
