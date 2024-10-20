import AbstractView from '../framework/view/abstract-view';

const createEventsListTemplate = () => '<ul class="trip-events__list"></ul>';

export default class ListPoint extends AbstractView {
  get template() {
    return createEventsListTemplate();
  }
}
