import AbstractView from '../framework/view/abstract-view.js';
import {SortType} from '../utils-constant/constant.js';

function capitalizeText(text){
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const DISABLED_SORT_TYPES = [SortType.OFFERS, SortType.EVENT];

function createSortItemTemplate(type, checkedSortType){
  return `
      <div class="trip-sort__item  trip-sort__item--${type}">
        <input id="sort-${type}"
        class="trip-sort__input visually-hidden"
        data-sort-type="${type}"
        type="radio"
        name="trip-sort"
        value="sort-${type}"
        ${DISABLED_SORT_TYPES.includes(type) ? 'disabled' : ''}
        ${type === checkedSortType ? 'checked' : ''}>
        <label class="trip-sort__btn" for="sort-${type}" >${capitalizeText(type)}</label>
      </div>
  `;
}

function createSortListTemplate(checkedSortType) {
  return (`
    <form class="trip-events__trip-sort  trip-sort" action="#" method="get">
    ${Object.values(SortType).map((type)=>createSortItemTemplate(type, checkedSortType))
      .join('')}

    </form>`);
}
export default class SortView extends AbstractView {
  #handleSortTypeChange = null;
  #checkedSortType = null;

  constructor({checkedSortType, onSortTypeChange}) {
    super();
    this.#checkedSortType = checkedSortType;
    this.#handleSortTypeChange = onSortTypeChange;
    this.element.addEventListener('click', this.#sortTypeChangeHandler);
  }

  get template() {
    return createSortListTemplate(this.#checkedSortType);
  }

  #sortTypeChangeHandler = (evt) => {
    if (!evt.target.matches('input[name="trip-sort"]')) {
      return;
    }
    this.#handleSortTypeChange(evt.target.dataset.sortType);
  };

}
