import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { FORMATS, humanizePointDate, toggleOffers, capitalizeFirstLetter } from '../utils-constant/utils.js';
//import { capitalizeFirstLetter } from '../utils/common.js';
import he from 'he';
import flatpickr from 'flatpickr';

import 'flatpickr/dist/flatpickr.min.css';

const BLANK_POINT = {
  type: 'flight',
  destination: '',
  dateFrom: '',
  dateTo: '',
  basePrice: '0',
  offers: [],
};

function createTypeItemTemplate(type) {
  return `
    <div class="event__type-item">
      <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}">
      <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${capitalizeFirstLetter(type)}</label>
    </div>`;
}

function createDetailsTemplate(type, offers, destinationPoint, allOffers) {
  const details = [];
  if (offers) {
    const offersByTypePoint = allOffers.find((offer) => offer.type === type)?.offers;
    details.push(`
    <section class="event__section  event__section--offers">
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${offersByTypePoint?.map((offer) => {
    const checkedOfferPoint = offers.find((offerPointId) => offerPointId === offer.id);
    const isChecked = checkedOfferPoint ? 'checked' : '';
    return (`
        <div class="event__offer-selector">
          <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.value}-1" type="checkbox" name="event-offer-${offer.value}" ${isChecked}>
          <label class="event__offer-label" for="event-offer-${offer.value}-1" data-id="${offer.id}">
            <span class="event__offer-title">${offer.title}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-basePrice">${offer.price}</span>
          </label>
        </div>`);
  }).join('') || ''}
      </div>
    </section>`);
  }

  if (destinationPoint !== '' && (destinationPoint.picture.length > 0 || destinationPoint.description.trim() > 0)) {
    details.push (`
      <section class="event__section  event__section--destination">
        <h3 class="event__section-title  event__section-title--destination">Destination</h3>
        ${destinationPoint.description.trim() === 0 ? '' : `<p class="event__destination-description">${destinationPoint.description}</p>`}
        ${destinationPoint.picture.length > 0 ?
    `<div class="event__photos-container">
            <div class="event__photos-tape">
              ${destinationPoint.picture.map((e)=> `<img class="event__photo" src="${e.src}" alt="${e.description}">`).join('')}
            </div>
          </dev>` : ''}
      </section>`);
  }
  return details.join('');
}


function createEventTemplate(point = BLANK_POINT, allOffers, allDestinations, edit) {
  const {type, destination, dateFrom, dateTo, basePrice, offers} = point;
  const destinationPoint = destination !== '' ? allDestinations.find((item) => item.id === destination) : '' ;

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${allOffers.map((e) => createTypeItemTemplate(e.type)).join('')}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${type}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${he.encode(destinationPoint ? `${destinationPoint.name}` : '')}" list="destination-list-1" required>
            <datalist id="destination-list-1">
              ${allDestinations.map((e) => `<option value="${e.name}"></option>`).join('')}
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${humanizePointDate(dateFrom, FORMATS.FORM)}" required>
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${humanizePointDate(dateTo, FORMATS.FORM)}" required>
          </div>

          <div class="event__field-group  event__field-group--basePrice">
            <label class="event__label" for="event-basePrice-1">
              <span class="visually-hidden">basePrice</span>
              &euro;
            </label>
            <input class="event__input  event__input--basePrice" id="event-basePrice-1" type="text" name="event-basePrice" value="${basePrice}"  onkeyup="this.value = this.value.replace(/[^0-9]/g,'');" required>
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">${edit ? 'Delete' : 'Cancel'}</button>
        </header>
        <section class="event__details">
          ${createDetailsTemplate(type, offers, destinationPoint, allOffers)}
        </section>
      </form>
    </li>`;
}


export default class FormPointView extends AbstractStatefulView{
  #handleFormSubmit = null;
  #handleDeleteClick = null;
  #startDatepicker = null;
  #endDatepicker = null;

  constructor({point = BLANK_POINT, allOffers, allDestinations, onFormSubmit, onDeleteClick}) {
    super();
    this._setState(FormPointView.parsePointToState(point));
    this.allOffers = allOffers;
    this.allDestinations = allDestinations;
    this.isEdit = !!point.id;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleDeleteClick = onDeleteClick;
    this. _restoreHandlers();
  }


  get template() {
    return createEventTemplate(this._state, this.allOffers, this.allDestinations, this.isEdit);
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(FormPointView.parseStateToPoint(this._state));
  };

  #formDeleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick(FormPointView.parseStateToPoint(this._state));
  };

  #pointOfferClickHandler = (evt) => {
    evt.preventDefault();
    const labelElement = evt.target.closest('.event__offer-label');
    if(labelElement) {
      const offerActive = labelElement.dataset.id;
      const offers = [...this._state.offers];
      this.updateElement({
        offers: toggleOffers(offers, offerActive),
      });
    }
  };

  #pointTypeClickHandler = (evt) => {
    evt.preventDefault();
    const newType = evt.target.control.value;
    this.updateElement({
      type: newType,
    });
  };

  #pointDestinationChangeHandler = (evt) => {
    evt.preventDefault();
    const newDestination = this.allDestinations.find((destinations) => evt.target.value === destinations.name);
    if(!newDestination) {
      evt.target.value = '';
      return;
    }
    this.updateElement({
      destination: newDestination.id,
    });
  };

  #pointPriceChangeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      basePrice: evt.target.value,
    });
  };

  #setStartDatepicker = () => {
    this.#startDatepicker = flatpickr(
      this.element.querySelector('[id="event-start-time-1"]'),
      {
        dateFormat: 'd-m-y H:i',
        enableTime: true,
        defaultDate: new Date(this._state.dateFrom),
        maxDate:  new Date(this._state.dateTo),
        'time_24hr': true,
        onClose: this.#dateStartChangeHandler
      }
    );
  };

  #setEndDatepicker = () => {
    this.#endDatepicker = flatpickr(
      this.element.querySelector('[id="event-end-time-1"]'),
      {
        dateFormat: 'd-m-y H:i',
        enableTime: true,
        defaultDate: new Date(this._state.dateTo),
        minDate:  new Date(this._state.dateFrom),
        'time_24hr': true,
        onClose: this.#dateEndChangeHandler
      }
    );
  };

  #dateStartChangeHandler = ([userDate]) => {
    this.updateElement(
      {dateFrom: userDate,}
    );
  };

  #dateEndChangeHandler = ([userDate]) => {
    this.updateElement(
      { dateTo: userDate,}
    );
  };


  _restoreHandlers() {
    this.element.querySelector('.event--edit')
      .addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('.event__available-offers')
      .addEventListener('click', this.#pointOfferClickHandler);
    this.element.querySelector('.event__type-group')
      .addEventListener('click', this.#pointTypeClickHandler);
    this.element.querySelector('.event__input--destination')
      .addEventListener('change', this.#pointDestinationChangeHandler);
    this.element.querySelector('.event__input--basePrice')
      .addEventListener('change', this.#pointPriceChangeHandler);
    this.element.querySelector('.event__reset-btn')
      .addEventListener('click', this.#formDeleteClickHandler);

    this.#setStartDatepicker();
    this.#setEndDatepicker();
  }

  static parsePointToState(point) {
    return {...point};
  }

  static parseStateToPoint(state) {
    return {...state};
  }

  reset(point) {
    this.updateElement(
      FormPointView.parsePointToState(point)
    );
  }

  removeElement() {
    super.removeElement();

    if (this.#startDatepicker || this.#endDatepicker) {
      this.#startDatepicker.destroy();
      this.#endDatepicker.destroy();
      this.#startDatepicker = null;
      this.#endDatepicker = null;
    }
  }
}
