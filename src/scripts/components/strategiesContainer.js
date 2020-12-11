import { clearNode } from '../helpers/dom';
import EventDispatcher from "../helpers/eventDispatcher";

export const MODAL_CONTAINERS_MAP = {
  indicators: {
    indicatorsContainer: 'block',
    strategiesContainer: 'none',
    addIndicatorButton: 'block',
    strategyButton: _t('', 'Выбрать стратегию'),
  },
  strategies: {
    indicatorsContainer: 'none',
    strategiesContainer: 'block',
    addIndicatorButton: 'none',
    strategyButton: _t('', 'Вернуться к выбору индикаторов'),
  },
};

const MAX_STRATEGIES = 10;

export const EMPTY_STRATEGY = {
  name: '',
  indicators: [],
  tickers: [],
}

export function StrategiesContainer(strategiesList) {
  this.strategiesList = strategiesList;
}

StrategiesContainer.prototype.render = function () {
  const container = document.createElement('div');
  const header = document.createElement('h4');

  container.classList.add('js-chartTADialogContainerStrategies');
  header.innerText = _t('', 'Выбор стратегии');

  container.appendChild(header);
  container.appendChild(this.strategiesList.render());

  return container;
};

export function StrategiesList(addListItem) {
  this.items = [];

  this.events = new EventDispatcher();
}

StrategiesList.prototype.addItem = function (item) {
  if (!(item instanceof StrategiesListItem)) {
    throw new Error('StrategiesListItem was expected');
  }

  this.items.push(item);

  return this;
};

StrategiesList.prototype.addItems = function (items) {
  items.forEach(item => this.addItem(item));

  return this;
};

StrategiesList.prototype.renderAddItem = function () {
  const item = document.createElement('li');
  const text = document.createElement('span');
  const input = document.createElement('input');
  const iconPlus = document.createElement('i');
  const iconCheck = document.createElement('i');

  text.innerText = _t('', 'Добавить стратегию');
  iconPlus.classList.add('uk-icon-plus', 'uk-margin-left');
  iconCheck.classList.add('uk-icon-check', 'uk-margin-left');

  item.appendChild(text);
  item.appendChild(iconPlus);

  iconPlus.addEventListener('click', () => {
    item.removeChild(text);
    item.removeChild(iconPlus);
    item.appendChild(input);
    item.appendChild(iconCheck);
    input.focus();
  })

  iconCheck.addEventListener('click', () => {
    const value = input.value.trim();

    if (value) {
      this.events.dispatch('onSave', [value]);
    } else {
      input.value = '';
      item.removeChild(input);
      item.removeChild(iconCheck);
      item.appendChild(text);
      item.appendChild(iconPlus);
    }
  })

  return item;
};


StrategiesList.prototype.render = function () {
  if (!this.list) {
    this.list = document.createElement('ul');
    this.list.classList.add('uk-list', 'uk-list-line');
  } else {
    clearNode(this.list);
  }

  this.items.forEach(item => this.list.appendChild(item.render()));

  if (this.items.length < MAX_STRATEGIES) {
    this.list.appendChild(this.renderAddItem());
  }

  return this.list;
};

StrategiesList.prototype.listen = function (event, listener) {
  this.events.listen(event, listener);

  return this;
};


export function StrategiesListItem(item) {
  const { name, id } = item;

  if (!name) {
    throw new Error('Name is required');
  }

  this.id = id;
  this.name = name;

  this.events = new EventDispatcher();
}

StrategiesListItem.prototype.renderIcon = function (title, classNames, onClick) {
  const icon = document.createElement('i');

  icon.title = title;
  icon.classList.add(...classNames);
  icon.addEventListener('click', (event) => {
    event.preventDefault();

    onClick();
  });

  return icon;
};

StrategiesListItem.prototype.render = function () {
  const item = document.createElement('li');
  const text = document.createElement('span');

  item.appendChild(text);

  if (this.name === 'default') {
    text.innerText = _t('', 'По умолчанию');
  } else {
    text.innerText = this.name;

    item.appendChild(this.renderIcon(
      _t('', 'Переименовать'),
      ['uk-icon-pencil', 'uk-margin-left'],
      () => {
        // @fixme show edit form and on submit call next `this.events.dispatch()`

        // form.onSubmit(() => {
        //   this.events.dispatch('onEdit', [this]);
        // })
      }
    ));
    item.appendChild(this.renderIcon(
      _t('', 'Удалить'),
      ['uk-icon-remove', 'uk-margin-left'],
      () => {
        // @fixme show confirmation and on submit call next `this.events.dispatch()`

        // confirmation.onSubmit(() => {
        //   this.events.dispatch('onDelete', [this]);
        // });
      }
    ));
  }

  return item;
};

StrategiesListItem.prototype.listen = function (event, listener) {
  this.events.listen(event, listener);

  return this;
};
