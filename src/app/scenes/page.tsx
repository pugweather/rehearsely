import React from 'react';
import Navbar from '../components/layout/Navbar';
import SceneCard from '../components/scenes/SceneCard';
import db from '../database';
import { scenes } from '@/database/drizzle/schema';
import { createClient } from '../../../utils/supabase/server';
import { eq, desc } from 'drizzle-orm';
import ScenesDashboardClient from '../components/scenes/ScenesDashboardClient';
import { Scene } from '../types';

const ScenesDashboardPage = async () => {

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user) {
    return
  }

  const sceneData: Scene[] = await db
    .select()
    .from(scenes)
    .where(eq(scenes.user_id, user.id))
    .orderBy(desc(scenes.modified_at))

  return (
    <>
      <Navbar />
      <ScenesDashboardClient sceneData={sceneData}/>
    </>
  )
}

export default ScenesDashboardPage