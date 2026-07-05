import { faker } from "@faker-js/faker";
import { applySchema, db } from "./client";

const USER_COUNT = Number(process.env.SEED_COUNT) || 2000;

const NATIONALITIES = [
  "American", "British", "Canadian", "French", "German", "Japanese",
  "Chinese", "Indian", "Brazilian", "Mexican", "Italian", "Spanish",
  "Russian", "Korean", "Australian", "Dutch", "Swedish", "Norwegian",
  "Egyptian", "Nigerian", "Kenyan", "Turkish", "Greek", "Portuguese",
  "Polish", "Ukrainian", "Vietnamese", "Thai", "Indonesian", "Filipino",
  "Argentinian", "Chilean", "Colombian", "Emirati", "Saudi",
];

const HOBBIES = [
  "Reading", "Cooking", "Hiking", "Cycling", "Swimming", "Photography",
  "Painting", "Gaming", "Gardening", "Fishing", "Running", "Yoga",
  "Chess", "Traveling", "Writing", "Singing", "Dancing", "Knitting",
  "Woodworking", "Pottery", "Baking", "Camping", "Climbing", "Surfing",
  "Skiing", "Skateboarding", "Birdwatching", "Astronomy", "Coding",
  "Calligraphy", "Origami", "Meditation", "Boxing", "Archery", "Sailing",
  "Fencing", "Juggling", "Magic", "Collecting", "Blogging",
];

function seed(): void {
  console.log(`Seeding database with ${USER_COUNT} users...`);
  applySchema();

  const insertHobby = db.prepare(
    "INSERT INTO hobbies (name) VALUES (?) RETURNING id"
  );
  const hobbyIds = HOBBIES.map((name) => {
    const row = insertHobby.get(name) as { id: number };
    return { name, id: row.id };
  });

  const insertUser = db.prepare(`
    INSERT INTO users (avatar, first_name, last_name, age, nationality)
    VALUES (@avatar, @first_name, @last_name, @age, @nationality)
  `);
  const insertUserHobby = db.prepare(
    "INSERT INTO user_hobbies (user_id, hobby_id) VALUES (?, ?)"
  );

  const seedTransaction = db.transaction(() => {
    for (let i = 0; i < USER_COUNT; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const seedKey = `${firstName}-${lastName}-${i}`;

      const result = insertUser.run({
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          seedKey
        )}`,
        first_name: firstName,
        last_name: lastName,
        age: faker.number.int({ min: 18, max: 85 }),
        nationality: faker.helpers.arrayElement(NATIONALITIES),
      });

      const userId = result.lastInsertRowid as number;
      const hobbyCount = faker.number.int({ min: 0, max: 10 });
      const userHobbies = faker.helpers.arrayElements(hobbyIds, hobbyCount);
      for (const hobby of userHobbies) {
        insertUserHobby.run(userId, hobby.id);
      }
    }
  });

  seedTransaction();
  console.log("Seed complete.");
}

if (require.main === module) {
  seed();
}
