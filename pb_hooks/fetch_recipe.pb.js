routerAdd("GET", "/api/fetch-recipe", (e) => {
  try {
    const url = e.request.url.query().get("url")

    if (!url || !url.includes("matprat.no")) {
      return e.json(400, { error: "Ugyldig URL – kun matprat.no støttes" })
    }

    let res
    try {
      res = $http.send({
        url: url,
        method: "GET",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; middagsplanlegger/1.0)" },
        timeout: 15,
      })
    } catch (httpErr) {
      return e.json(502, { error: "Kunne ikke hente siden: " + String(httpErr) })
    }

    if (res.statusCode !== 200) {
      return e.json(502, { error: "Siden svarte med " + res.statusCode })
    }

    const html = res.raw || res.body || ""

    const ldRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    let match
    let recipe = null

    while ((match = ldRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1])
        const items = Array.isArray(data) ? data : [data]
        const found = items.find(function(i) { return i["@type"] === "Recipe" })
        if (found) {
          recipe = found
          break
        }
      } catch (_) {
        // skip invalid JSON blocks
      }
    }

    if (!recipe) {
      return e.json(404, { error: "Fant ingen oppskrift på denne siden" })
    }

    return e.json(200, {
      name: recipe.name || "",
      description: recipe.description || "",
      ingredients: recipe.recipeIngredient || [],
      categories: recipe.recipeCategory || [],
      cuisine: recipe.recipeCuisine || [],
    })
  } catch (err) {
    return e.json(500, { error: "Hook-feil: " + String(err) })
  }
})
