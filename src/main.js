import BoardPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import PointsModel from './model/point-model.js';
import FilterModel from './model/filter-model.js';
import EditPointButton from './view/new-point-button-view.js';
import PointsApiService from './points-api-service.js';
import { render, RenderPosition } from './framework/render.js';

const AUTHORIZATION = 'Basic giekf36he9854e';
const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';
const siteTripInfoElement = document.querySelector('.trip-main');
const filtersContainer = siteTripInfoElement.querySelector('.trip-controls__filters');
const listContainer = document.querySelector('.trip-events');
const filterModel = new FilterModel();
const pointsModel = new PointsModel({
  pointsApiService: new PointsApiService(END_POINT, AUTHORIZATION)
});

const newPointButton = new EditPointButton({
  onClick: handleNewPointButtonClick
});

const boardPresenter = new BoardPresenter({
  mainContainer: siteTripInfoElement,
  pointListContainer: listContainer,
  pointsModel,
  filterModel,
  newPointButton,
  onNewPointDestroy: handleEditNewPointClose
});


const filterPresenter = new FilterPresenter({
  filtersContainer: filtersContainer,
  filterModel: filterModel,
  pointsModel: pointsModel
});


function handleNewPointButtonClick() {
  boardPresenter.createPoint();
  newPointButton.element.disable = true;
}

function handleEditNewPointClose() {
  newPointButton.element.disabled = false;
}

boardPresenter.init();
pointsModel.init() .finally(() => {
  filterPresenter.init();
  render(newPointButton, siteTripInfoElement, RenderPosition.BEFOREEND);
});
