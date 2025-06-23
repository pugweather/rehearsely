import { User as SupabaseUser } from '@supabase/auth-js'

// Characters
export type Character = {
    id: number,
    name: string,
    scene_id: number,
    voice_id: string,
    is_me: boolean
};

// Lines
export type DraftLine = {
    character_id: number | null,
    id: number | null,
    order: number | null,
    scene_id: number | null,
    text: string | null,
    isNew?: boolean
};

export type Line = {
    character_id: number,
    id: number,
    order: number,
    scene_id: number,
    text: string | null
    audio_url: string
}

export type LineBeingEditedData = {
    voice: Voice | null
    character: Character | null,
    text: string | null,
    order: number | null
}

// Dropdowns
export type DropdownData = {
    label: string,
    onClick: () => void,
    className?: string
};

export type DropdownItem = {
    label: string,
    onClick: () => void,
    className?: string
}
  
export type DropdownProps = {
    dropdownData: DropdownItem[] | undefined,
    dropdownPos: {top: number, right: number} | null,
    className?: string,
    closeDropdown: () => void
}

// Scenes
export type Scene = {
    id: number;
    name: string | null;
    modified_at: string;
    user_id: string;
};

// Users
export type User = {
    id: string,
    name: string | null,
    email: string,
    created_at: string
}

export type UserStore = {
    user: SupabaseUser | null,
    setUser: (user: SupabaseUser | null) => void
}

// Voices

type VoiceLabel = {
    accent: string,
    description: string,
    age: string,
    gender: string,
    use_case: string
}

export type Voice = {
    voice_id: string,
    name: string,
    labels: VoiceLabel,
    preview_url: string
}

export type VoicesStore =  {
    voices: Voice[] | null,
    voicesCategorized: Record<string,{male: Voice[], female: Voice[]}> | null,
    setVoices:(voices: Voice[] | null) => void
    setVoicesCategorized:(voicesCategorized: Record<string, {male: Voice[], female: Voice[]}> | null) => void
}