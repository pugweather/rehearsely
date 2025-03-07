import db from "./database";
import { User } from "@/database/drizzle/schema";

export default async function Home() {

  async function getUserById() {
    const user = await db.query.User.findFirst({
      where: (user, { eq }) => eq(user.id, 1)
    })
    return user
  }

  const theUser = await getUserById()

  return (
    <div>
      <main>
        {theUser ? <div>{theUser.name}</div> : <div>no user found</div>
      }
      </main>
      <footer></footer>
    </div>
  );
}
