const dbURL = process.env.VUE_APP_FIREBASE_DATABASE_URL;

export default {
  async fetchInitialData(context) {
    try {
      const response = await fetch(`${dbURL}/boards.json`);

      if (!response.ok) {
        throw new Error('Failed to fetch initial data');
      }

      const boardsData = await response.json();
      const boards = Object.keys(boardsData)
        .map((key) => ({
          id: key,
          title: boardsData[key].title,
          content: boardsData[key].content,
          time: boardsData[key].time,
          comments: boardsData[key].comments || [],
          author: boardsData[key].author,
          university: boardsData[key].university,
          userUid: boardsData[key].userUid,
        }))
        .reverse();

      context.commit('setBoards', boards);
    } catch (error) {
      console.error('Error fetching initial data:', error.message);
    }
  },

  async registerBoard(context, data) {
    const boardData = {
      title: data.title,
      content: data.content,
      time: new Date().toISOString(),
      comments: [],
      author: data.author,
      university: data.university,
      userUid: data.id,
    };

    try {
      const response = await fetch(`${dbURL}/boards.json`, {
        method: 'POST',
        body: JSON.stringify(boardData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to register board');
      }

      const responseData = await response.json();
      context.commit('registerBoard', { id: responseData.name, ...boardData });

      context.dispatch('fetchInitialData');
    } catch (error) {
      console.error('Error registering board:', error.message);
    }
  },

  async deleteBoard(context, boardId) {
    try {
      const response = await fetch(`${dbURL}/boards/${boardId}.json`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete board');

      context.commit('deleteBoard', boardId);
    } catch (error) {
      console.error('Error adding comment:', error.message);
    }
  },

  async updateBoard(context, updatedBoard) {
    try {
      const response = await fetch(`${dbURL}/boards/${updatedBoard.id}.json`, {
        method: 'PUT',
        body: JSON.stringify(updatedBoard),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update board');
      }

      context.commit('UPDATE_BOARD', updatedBoard);
    } catch (error) {
      console.error('Error updating board:', error.message);
    }
  },

  async addComment(context, { boardId, comment, userName, userId }) {
    try {
      const boardResponse = await fetch(`${dbURL}/boards/${boardId}.json`);
      if (!boardResponse.ok) {
        throw new Error('Failed to fetch board data');
      }

      const boardData = await boardResponse.json();

      if (!Array.isArray(boardData.comments)) {
        boardData.comments = [];
      }

      const newComment = {
        text: comment,
        time: new Date().toISOString(),
        userName: userName,
        userId: userId,
      };
      boardData.comments.push(newComment);

      const updateResponse = await fetch(`${dbURL}/boards/${boardId}.json`, {
        method: 'PUT',
        body: JSON.stringify(boardData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to add comment');
      }

      context.dispatch('fetchInitialData');
    } catch (error) {
      console.error('Error adding comment:', error.message);
    }
  },
};
