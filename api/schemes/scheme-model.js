// ===== IMPORTS =====
const db = require("../../data/db-config")

async function find() { // EXERCISE A
  const allSchemes = await db("schemes")
    .leftJoin("steps", "schemes.scheme_id", "steps.scheme_id")
    .select("schemes.scheme_id", "schemes.scheme_name")
    .count("steps.step_number as number_of_steps")
    .groupBy("schemes.scheme_id")
  return allSchemes
  /*
  RAW SQL:
  SELECT schemes.scheme_id, schemes.scheme_name,
  count(steps.step_number) AS number_of_steps
  FROM schemes
  LEFT JOIN steps
  ON schemes.scheme_id = steps.scheme_id
  GROUP BY schemes.scheme_id;

    1A- Study the SQL query below running it in SQLite Studio against `data/schemes.db3`.
    What happens if we change from a LEFT join to an INNER join?

      SELECT
          sc.*,
          count(st.step_id) as number_of_steps
      FROM schemes as sc
      LEFT JOIN steps as st
          ON sc.scheme_id = st.scheme_id
      GROUP BY sc.scheme_id
      ORDER BY sc.scheme_id ASC;

    2A- When you have a grasp on the query go ahead and build it in Knex.
    Return from this function the resulting dataset.
  */
}

async function findById(scheme_id) { // EXERCISE B
  const schemeArray = await db("schemes")
    .select('schemes.scheme_id',
      'schemes.scheme_name',
      'steps.instructions',
      'steps.step_number',
      'steps.step_id')
    .leftJoin("steps",
      "schemes.scheme_id",
      "steps.scheme_id")
    .orderBy("steps.step_number", "asc")
    .where("schemes.scheme_id", scheme_id)

  const schemeWithSteps = { steps: [] }
  schemeWithSteps.scheme_id = schemeArray[0].scheme_id
  schemeWithSteps.scheme_name = schemeArray[0].scheme_name

  schemeArray.filter(scheme => {
    const { step_id, step_number, instructions } = scheme
    if (!step_id || !step_number || !instructions) {
      return []
    } else {
      return schemeWithSteps.steps.push({
        step_id: step_id,
        step_number: step_number,
        instructions: instructions
      })
    }
  })

  return schemeWithSteps
  /*
  RAW SQL:
    SELECT schemes.scheme_id, schemes.scheme_name, steps.instructions,
    steps.step_number,
    steps.step_id
    FROM schemes
    LEFT JOIN steps
    ON schemes.scheme_id = steps.scheme_id
    WHERE schemes.scheme_id = {scheme_id};

  1B- Study the SQL query below running it in SQLite Studio against `data/schemes.db3`:

      SELECT
          sc.scheme_name,
          st.*
      FROM schemes as sc
      LEFT JOIN steps as st
          ON sc.scheme_id = st.scheme_id
      WHERE sc.scheme_id = 1
      ORDER BY st.step_number ASC;

    2B- When you have a grasp on the query go ahead and build it in Knex
    making it parametric: instead of a literal `1` you should use `scheme_id`.

    3B- Test in Postman and see that the resulting data does not look like a scheme,
    but more like an array of steps each including scheme information:

      [
        {
          "scheme_id": 1,
          "scheme_name": "World Domination",
          "step_id": 2,
          "step_number": 1,
          "instructions": "solve prime number theory"
        },
        {
          "scheme_id": 1,
          "scheme_name": "World Domination",
          "step_id": 1,
          "step_number": 2,
          "instructions": "crack cyber security"
        },
        // etc
      ]

    4B- Using the array obtained and vanilla JavaScript, create an object with
    the structure below, for the case _when steps exist_ for a given `scheme_id`:

      {
        "scheme_id": 1,
        "scheme_name": "World Domination",
        "steps": [
          {
            "step_id": 2,
            "step_number": 1,
            "instructions": "solve prime number theory"
          },
          {
            "step_id": 1,
            "step_number": 2,
            "instructions": "crack cyber security"
          },
          // etc
        ]
      }

    5B- This is what the result should look like _if there are no steps_ for a `scheme_id`:

      {
        "scheme_id": 7,
        "scheme_name": "Have Fun!",
        "steps": []
      }
  */
}

async function lookForId(scheme_id) {
  const [foundId] = await db("schemes")
    .select("scheme_id")
    .where("scheme_id", scheme_id)
  if (foundId === undefined) {
    return null
  }
  return true
}

async function findSteps(scheme_id) { // EXERCISE C
  const steps = await db("schemes")
    .select("schemes.scheme_name",
      "steps.step_id",
      "steps.instructions",
      "steps.step_number")
    .leftJoin("steps",
      "schemes.scheme_id",
      "steps.scheme_id")
    .where("schemes.scheme_id", scheme_id)
    .orderBy("steps.step_number")

  if (steps[0].instructions === null) {
    return []
  }
  return steps
  /*
  RAW SQL:
    SELECT schemes.scheme_name,
    steps.step_id,
    steps.instructions,
    steps.step_number
    FROM schemes
    LEFT JOIN steps
    ON schemes.scheme_id = steps.scheme_id
    WHERE schemes.scheme_id = 1
    ORDER BY steps.step_number;

    1C- Build a query in Knex that returns the following data.
    The steps should be sorted by step_number, and the array
    should be empty if there are no steps for the scheme:

      [
        {
          "step_id": 5,
          "step_number": 1,
          "instructions": "collect all the sheep in Scotland",
          "scheme_name": "Get Rich Quick"
        },
        {
          "step_id": 4,
          "step_number": 2,
          "instructions": "profit",
          "scheme_name": "Get Rich Quick"
        }
      ]
  */
}

async function add(scheme) { // EXERCISE D
  const [newSchemeId] = await db("schemes")
    .insert(scheme)
  const newScheme = await findById(newSchemeId)
  return newScheme
  /*
    1D- This function creates a new scheme and resolves to _the newly created scheme_.
  */
}

async function addStep(scheme_id, step) { // EXERCISE E
  await db("steps")
    .insert({
      ...step,
      scheme_id: scheme_id
    })
  const steps = await findSteps(scheme_id)
  return steps
  /*
 RAW SQL:
  INSERT INTO steps ("step_number", "instructions""scheme_id")
  VALUES ("1", "this is a test", "7");
    1E- This function adds a step to the scheme with the given `scheme_id`
    and resolves to _all the steps_ belonging to the given `scheme_id`,
    including the newly created one.
  */
}

module.exports = {
  find,
  findById,
  findSteps,
  add,
  addStep,
  lookForId,
}
