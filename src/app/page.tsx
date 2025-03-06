"use client"

import { useEffect, useState } from "react";
import supabase from "@/app/config/supabaseClient";

export default function Home() {

  interface User {
    id: number,
    email: string,
    name: string,
  }

  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      const {error, data} = await supabase.from("User").select()
      if (error) {
        console.error("Error fetching users:", error.message)
      }
      if (data) {
        setUsers(data)
      }
    }
    fetchUsers()
  }, []);

  return (
    <div>
      <main>
        <ul>
          {users.map(user => {
            return (
              <li>{user.name} {user.email}</li>
            )
          })}
        </ul>
      </main>
      <footer></footer>
    </div>
  );
}
