routerAdd("GET", "/api/fetch-recipe", (c) => {
  const url = c.queryParam("url")

  if (!url || !url.includes("matprat.no")) {
    return c.json(400, { error: "Ugyldig URL – kun matprat.no støttes" })
  }

  let res
  try {
    res = $http.send({
      url: url,
      method: "GET",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; middagsplanlegger/1.0)" },
      timeout: 15,
    })
  } catch (e) {
    return c.json(502, { error: "Kunne ikke hente siden: " + String(e) })
  }

  if (res.statusCode !== 200) {
    return c.json(502, { error: "Siden svarte med " + res.statusCode })
  }

  // Find all JSON-LD blocks and pick the Recipe one
  const ldRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match
  let recipe = null

  while ((match = ldRegex.exec(res.raw)) !== null) {
    try {
      const data = JSON.parse(match[1])
      const items = Array.isArray(data) ? data : [data]
      const found = items.find(function(i) { return i["@type"] === "Recipe" })
      if (found) {
        recipe = found
        break
      }
    } catch (_) {
      // not valid JSON, skip
    }
  }

  if (!recipe) {
    return c.json(404, { error: "Fant ingen oppskrift på denne siden" })
  }

  return c.json(200, {
    name: recipe.name || "",
    description: recipe.description || "",
    ingredients: recipe.recipeIngredient || [],
    categories: recipe.recipeCategory || [],
    cuisine: recipe.recipeCuisine || [],
  })
})
