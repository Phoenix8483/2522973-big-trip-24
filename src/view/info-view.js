import AbstractView from '../framework/view/abstract-view.js';
import {humanizePointDate, DATE_FORMAT } from '../utils-constant/date-time.js';

const createTripInfoTemplate = (destinations, dates, price) => {
  const createDatesSection = () => {
    if (dates) {
      const startRoute = humanizePointDate(dates[0], DATE_FORMAT.DATE_FOR_TRIP_INFO);
      const endRoute = humanizePointDate(dates[1], DATE_FORMAT.DATE_FOR_TRIP_INFO);
      return `<p class="trip-info__dates">${startRoute}&nbsp;&mdash;&nbsp;${endRoute}</p>`;
    }
    return '';
  };

  const createTitleSection = () => {
    if (destinations.length === 0 || !destinations) {
      return '';
    } else if (destinations.length === 1) {
      return `<h1 class="trip-info__title">${destinations[0]}</h1>`;
    } else if (destinations.length < 3) {
      return `<h1 class="trip-info__title">${destinations[0]} &mdash; &mdash; ${destinations[1]}</h1>`;
    } else if (destinations.length === 3) {
      return `<h1 class="trip-info__title">${destinations[0]} &mdash; ${destinations[1]} &mdash; ${destinations[2]}</h1>`;
    }
  };

  const priceSection = price ? `Total: &euro;&nbsp;<span class="trip-info__price-value">${price}</span>` : '';
  return (`
    <section class="trip-main__trip-info  trip-info" style="justify-content: space-between">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${createTitleSection()}</h1>

        <p class="trip-info__dates">${createDatesSection()}</p>
      </div>

      <p class="trip-info__price">
       ${priceSection}
      </p>
    </section>`);
};

export default class TripInfoView extends AbstractView {
  #destinations = null;
  #dates = null;
  #price = null;

  constructor({destinations, dates, price}) {
    super();
    this.#destinations = destinations;
    this.#dates = dates;
    this.#price = price;
  }

  get template() {
    return createTripInfoTemplate(this.#destinations, this.#dates, this.#price);
  }
}
