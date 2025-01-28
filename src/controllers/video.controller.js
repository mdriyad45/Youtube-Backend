import { Video } from "../models/videos.model.js";
// get all videos based on query, sort, pagination, view , duration

export const getSearchVideo = async (req, res) => {
  try {
    const { query, autocomplete, category, tags, sortBy, limit } = req.query;

    const pipeline = [];
    console.log(query.toString(), autocomplete, sortBy);
    //AutoComplete with fuzzy search
    if (autocomplete === true) {
      pipeline.push({
        $search: {
          index: "videoSearch",
          autocomplete: {
            query: query,
            path: ["title", "description"],
            tokenOrder: "sequential",
            fuzzy: {
              maxEdit: 2, // Number of character changes allowed,
              prefixLength: 1, // Number of characters at the start that must match exactly
              maxExpansion: 100, // : Limits the number of variations MongoDB generates for the fuzzy match.
            },
          },
        },
      });
    } else {
      const compoundQuery = { must: [], should: [], filter: [] };

      if (query) {
        compoundQuery.must.push({
          text: {
            query: query,
            path: ["title", "description"],
          },
        });
      }
      //filter by categary
      // Boost relevance for matches in this category
      if (category) {
        compoundQuery.should.push({
          text: {
            query: category,
            path: "category",
            score: { boost: { value: 3 } },
          },
        });
      }

      if (tags) {
        compoundQuery.filter.push({
          text: {
            query: tags.split(","),
            path: "tags",
          },
        });
      }

      pipeline.push({
        $search: {
          index: "videoSearch",
          compound: compoundQuery,
        },
      });
    }

    //sorting
    if (sortBy) {
      pipeline.push({
        $sort: {
          [sortBy]: -1,
        },
      });
    }

    const resultsLimit = parseInt(limit) || 10;
    pipeline.push({ $limit: resultsLimit });

    const videos = await Video.aggregate(pipeline);
    
    res.status(200).json({
      message: "get search",
      dataLength: videos.length,
      data: videos,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
};
