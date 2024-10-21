import {remove, render, RenderPosition} from '../framework/render.js';
import FormPointView from '../view/add-point-view.js';
import {nanoid} from 'nanoid';
import {UserAction, UpdateType} from '../utils-constant/constant.js';

export default class NewPointPresenter {
  #pointListContainer = null;
  #handleDataChange = null;
  #handleDestroy = null;
  #pointEditComponent = null;

  constructor({allOffers, allDestinations, pointListContainer, onDataChange, onDestroy}) {
    this.#pointListContainer = pointListContainer;
    this.#handleDataChange = onDataChange;
    this.#handleDestroy = onDestroy;
    this.allOffers = allOffers;
    this.allDestinations = allDestinations;
  }

  init() {
    this.#pointEditComponent = new FormPointView({
      allOffers: this.allOffers,
      allDestinations: this.allDestinations,
      onFormSubmit: this.#handleFormSubmit,
      onDeleteClick: this.#handleDeleteClick
    });
    render(this.#pointEditComponent, this.#pointListContainer, RenderPosition.AFTERBEGIN);
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  destroy() {
    if (this.#pointEditComponent === null) {
      return;
    }
    this.#handleDestroy();
    remove(this.#pointEditComponent);
    this.#pointEditComponent = null;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  #handleFormSubmit = (point) => {
    this.#handleDataChange(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      {id: nanoid(), ...point},
    );
    this.destroy();
  };

  #handleDeleteClick = () => {
    this.destroy();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.destroy();
    }
  };
}
