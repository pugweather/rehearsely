import React from 'react';
import Navbar from '../components/layout/Navbar';
import SceneCard from '../components/scenes-dashboard/SceneCard';
import db from '../database';
import { scenes } from '@/database/drizzle/schema';
import { createClient } from '../../../utils/supabase/server';
import { eq, desc } from 'drizzle-orm';
import ScenesDashboardClient from '../components/scenes-dashboard/ScenesDashboardClient';
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
    <div className="h-screen w-full bg-main flex flex-col">
      <Navbar />
      <div className="max-w-[75rem] w-full flex-grow mt-2 m-auto bg-main">
        <ScenesDashboardClient sceneData={sceneData}/>
      </div>
    </div>
  )
}

export default ScenesDashboardPage