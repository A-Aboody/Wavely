export const searchAnime = async (searchQuery) => {
    if (!searchQuery.trim()) return [];
    
    try {
      const query = `
        query ($search: String) {
          Page(page: 1, perPage: 10) {
            media(search: $search, type: ANIME) {
              id
              title {
                romaji
                english
                native
              }
              coverImage {
                large
              }
              averageScore
              genres
              format
              episodes
            }
          }
        }
      `;
      
      const variables = {
        search: searchQuery
      };
      
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables
        })
      });
      
      const result = await response.json();
      return result.data.Page.media;
    } catch (error) {
      console.error("Error searching anime:", error);
      throw error;
    }
  };