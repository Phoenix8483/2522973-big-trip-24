import SortView from '../view/sort-view.js';
import EmptyListView from '../view/empty-list-view.js';
import ListPointView from '../view/list-point-view.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presener.js';
import TripInfoPresenter from './info-presenter.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import { render, remove, RenderPosition } from '../framework/render.js';
import { sortByPrice, sortByTime, sortByDay } from '../utils-constant/utils.js';
import { SortType, UpdateType, UserAction, FilterType, filter, TimeLimit, NO_POINT_TEXT } from '../utils-constant/constant.js';

export default class BoardPresenter {
  #mainContainer = null;
  #pointListContainer = null;
  #pointsModel = null;
  #filterModel = null;
  #sortComponent = null;
  #pointListComponent = new ListPointView();
  #pointPresenters = new Map();
  #loadingComponent = null;
  #loadingErrorComponent = null;
  #noPointComponent = null;
  #newPointPresenter = null;
  #tripInfoPresenter = null;
  #filterType = FilterType.EVERYTHING;
  #currentSortType = SortType.DAY;
  #loadingText = Object.keys(NO_POINT_TEXT).find((item) => item === 'LOADING');
  #loadingErrorText = Object.keys(NO_POINT_TEXT).find((item) => item === 'LOADING_ERROR');
  #newPointButton = null;
  #isLoading = true;
  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

  constructor({mainContainer, pointListContainer, pointsModel, filterModel, newPointButton, onNewPointDestroy}) {
    this.#mainContainer = mainContainer;
    this.#pointListContainer = pointListContainer;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
    this.#isLoading = true;
    this.#newPointButton = newPointButton.element;

    this.#newPointPresenter = new NewPointPresenter({
      pointListComponent: this.#pointListComponent.element,
      pointsModel: this.#pointsModel,
      onDataChange: this.#handleViewAction,
      onDestroy: onNewPointDestroy,
      onReset: this.#handleFormReset
    });
  }

  get points() {
    this.#filterType = this.#filterModel.filter;
    const points = this.#pointsModel.points;
    const filteredPoint = filter[this.#filterType](points);

    switch (this.#currentSortType) {
      case SortType.TIME:
        return filteredPoint.sort(sortByTime);
      case SortType.PRICE:
        return filteredPoint.sort(sortByPrice);
    }
    return filteredPoint.sort(sortByDay);
  }

  get offers() {
    return this.#pointsModel.offers;
  }

  get destinations() {
    return this.#pointsModel.destinations;
  }

  get error() {
    return this.#pointsModel.error;
  }

  init() {
    this.#renderBoard();
  }

  createPoint() {
    this.#currentSortType = SortType.DAY;
    this.#filterType = FilterType.EVERYTHING;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#newPointPresenter.init();
    if (this.#noPointComponent) {
      remove(this.#noPointComponent);
    }
    this.#newPointButton.disabled = true;
  }

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();

    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointPresenters.get(update.id).setSaving();
        try {
          await this.#pointsModel.updatePoint(updateType, update);
        } catch(err) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
      case UserAction.ADD_POINT:
        this.#newPointPresenter.setSaving();
        try {
          await this.#pointsModel.addPoint(updateType, update);
        } catch(err) {
          this.#newPointPresenter.setAborting();
        }
        break;
      case UserAction.DELETE_POINT:
        this.#pointPresenters.get(update.id).setDeleting();
        try {
          await this.#pointsModel.deletePoint(updateType, update);
        } catch(err) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
    }
    this.#uiBlocker.unblock();
  };


  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({resetSortType: true});
        this.#renderBoard();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.#renderBoard();
        break;
    }
  };

  #handleModeChange = () => {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #renderInfo() {
    this.#tripInfoPresenter = new TripInfoPresenter({
      pointsModel: this.#pointsModel,
      mainContainer: this.#mainContainer
    });
    this.#tripInfoPresenter.init();
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#clearBoard();
    this.#renderBoard();
  };

  #renderSort() {
    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });

    render(this.#sortComponent, this.#pointListContainer, RenderPosition.AFTERBEGIN);
  }

  #handleFormReset = () => {
    if (this.points.length === 0) {
      remove(this.#sortComponent);
      this.#renderNoPoint();
    }
  };

  #renderNoPoint() {
    this.#noPointComponent = new EmptyListView({filterType: this.#filterType});
    render(this.#noPointComponent, this.#pointListContainer);
  }

  #renderLoading() {
    this.#loadingComponent = new EmptyListView({
      filterType: this.#loadingText,
    });
    render(this.#loadingComponent, this.#pointListContainer);
  }

  #renderLoadingError() {
    this.#loadingErrorComponent = new EmptyListView({
      filterType: this.#loadingErrorText,
    });
    this.#newPointButton.disabled = true;
    render(this.#loadingErrorComponent, this.#pointListContainer);
  }

  #clearBoard({resetSortType = false} = {}) {
    this.#tripInfoPresenter.destroy();
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
    remove(this.#sortComponent);
    remove(this.#loadingComponent);
    if (this.#noPointComponent) {
      remove(this.#noPointComponent);
    }
    if (resetSortType) {
      this.#currentSortType = SortType.DAY;
    }
  }

  #renderPointsList() {
    render(this.#pointListComponent, this.#pointListContainer);
    this.points.forEach((point) => this.#renderPoint(point));
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListComponent: this.#pointListComponent.element,
      pointsModel: this.#pointsModel,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderBoard() {

    if (this.error) {
      this.#renderLoadingError();
      return;
    }

    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }

    if (this.points.length > 0){
      this.#renderSort();
    }

    const filterType = this.#filterModel.filter;

    if (this.points.length === 0) {
      this.#renderNoPoint(filterType);
    }

    this.#renderInfo();
    this.#renderPointsList();
  }
}
