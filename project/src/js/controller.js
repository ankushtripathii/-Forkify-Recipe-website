import * as model from './model.js';
import { MODAL_CLOSE_TIME } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultView from './views/resultView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

//from parcel
if (module.hot) {
  module.hot.accept();
}

const controlRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);
    console.log(id);
    if (!id) return;
    recipeView.renderSpinner();
    //0) update result view to mark selected search result
    resultView.update(model.getResultPerPage());
    //1) updated bookmark
    bookmarksView.update(model.state.bookmarks);

    //2) Loading recipe
    await model.loadRecipe(id);

    // 3) Rendering Recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResult = async function () {
  try {
    resultView.renderSpinner();
    //1) get search query
    const query = searchView.getQuery();
    if (!query) return;
    //2)load search results
    await model.loadSearchResult(query);
    //3) render results
    // console.log(model.state.search.results);
    // resultView.render(model.state.search.results);
    resultView.render(model.getResultPerPage());

    //4) render pagination button
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};
const controlPagination = function (goToPage) {
  //1) render new results
  resultView.render(model.getResultPerPage(goToPage));

  //2) render new  pagination button
  paginationView.render(model.state.search);
};

const controlServings = function (newServing) {
  //update the recipe servinf(in state)
  model.updateServings(newServing);

  // update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};
const controlAddBookmarks = function () {
  //1) Add /delete bookmarks
  if (!model.state.recipe.bookmarked) model.addBookmarked(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //2)update recipe view
  recipeView.update(model.state.recipe);
  //3) render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmark = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  console.log(newRecipe);
  try {
    //show loading spinner
    addRecipeView.renderSpinner();
    // upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //Render recipe
    recipeView.render(model.state.recipe);

    //uploaded success
    addRecipeView.renderMessage();

    //render bookmarks view
    bookmarksView.render(model.state.bookmarks);

    //chnage ID in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_TIME * 1000);
  } catch (err) {
    console.error('💀', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRecipe(controlBookmark);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateSerings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookmarks);
  searchView.addHandlerSearch(controlSearchResult);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
