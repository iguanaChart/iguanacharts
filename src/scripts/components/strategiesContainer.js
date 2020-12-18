import { clearNode } from '../helpers/dom';
import EventDispatcher from '../helpers/eventDispatcher';

const MODAL_CONTAINERS_MAP = {
  indicators: {
    indicatorsContainer: 'block',
    strategiesContainer: 'none',
    addIndicatorButton: 'block',
    strategyButton: _t('', 'Стратегии'),
  },
  strategies: {
    indicatorsContainer: 'none',
    strategiesContainer: 'block',
    addIndicatorButton: 'none',
    strategyButton: _t('', 'Вернуться к выбору индикаторов'),
  },
};

const MODAL_TYPES = {
  STRATEGIES: 'strategies',
  INDICATORS: 'indicators',
}

const MAX_STRATEGIES = 10;

const DEFAULT_STRATEGY_NAME = 'default';

const EMPTY_STRATEGY = {
  name: '',
  indicators: [],
  tickers: [],
};

const DEFAULT_STRATEGY = {
  name: 'default',
  indicators: [],
};

const DEFAULT_STRATEGIES = [DEFAULT_STRATEGY];

function StrategiesContainer(strategiesList) {
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

function StrategiesList() {
  this.items = [];
  this.selectedStrategy = null;

  this.events = new EventDispatcher();
}

StrategiesList.prototype.addItem = function (item) {
  if (!(item instanceof StrategiesListItem)) {
    throw new Error('StrategiesListItem was expected');
  }

  this.items.push(item);

  return this;
};

StrategiesList.prototype.removeItem = function (id) {

  this.items.splice(id, 1);

  return this;
};

StrategiesList.prototype.addItems = function (items) {
  items.forEach(item => this.addItem(item));

  return this;
};

StrategiesList.prototype.setSelectedStrategy = function (selectedStrategy) {
  this.selectedStrategy = selectedStrategy;

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

  this.items.forEach(item => this.list.appendChild(
    item
      .setIsSelected(item.getName() === this.selectedStrategy)
      .render()
  ));

  if (this.items.length < MAX_STRATEGIES) {
    this.list.appendChild(this.renderAddItem());
  }

  return this.list;
};

StrategiesList.prototype.listen = function (event, listener) {
  this.events.listen(event, listener);

  return this;
};


function StrategiesListItem(item) {
  const { name, id } = item;

  if (!name) {
    throw new Error('Name is required');
  }

  this.id = id;
  this.name = name;
  this.state = {
    isEditing: false,
    isDeleting: false,
    isSelected: false,
  };

  this.events = new EventDispatcher();
}

StrategiesListItem.prototype.getName = function () {
  return this.name;
};

StrategiesListItem.prototype.setIsSelected = function (isSelected) {
  this.state.isSelected = Boolean(isSelected);

  return this;
};

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

StrategiesListItem.prototype.renderShowing = function () {
  const text = document.createElement('span');

  this.item.appendChild(text);

  if (this.state.isSelected) {
    text.classList.add('uk-text-bold');
  }

  text.addEventListener('click', () => {
    this.events.dispatch('onSelect', [this.name, !this.state.isSelected]);
  });

  if (this.name === 'default') {
    text.innerText = _t('', 'По умолчанию');
  } else {
    text.innerText = this.name;

    this.item.appendChild(this.renderIcon(
      _t('', 'Переименовать'),
      ['uk-icon-pencil', 'uk-margin-left'],
      () => {
        this.state.isEditing = true;
        this.render();
      }
    ));
    this.item.appendChild(this.renderIcon(
      _t('', 'Удалить'),
      ['uk-icon-remove', 'uk-margin-left'],
      () => {
        this.state.isDeleting = true;
        this.render();
      }
    ));
  }
};

StrategiesListItem.prototype.renderEditing = function () {
  const input = document.createElement('input');

  input.value = this.name;
  this.item.appendChild(input);
  input.focus();

  this.item.appendChild(this.renderIcon(
    _t('', 'Подтвердить'),
    ['uk-icon-check', 'uk-margin-left'],
    () => {
      this.state.isEditing = false;

      if (input.value && input.value !== this.name) {
        this.name = input.value;
        this.events.dispatch('onEdit', [input.value]);
      }

      this.render();
    }
  ));
  this.item.appendChild(this.renderIcon(
    _t('', 'Отмена'),
    ['uk-icon-mail-reply', 'uk-margin-left'],
    () => {
      this.state.isEditing = false;
      this.render();
    }
  ));
};

StrategiesListItem.prototype.renderDeleting = function () {
  const span = document.createElement('span');

  span.innerText = _t('', 'Вы уверены ?');
  this.item.appendChild(span);

  this.item.appendChild(this.renderIcon(
    _t('', 'Подтвердить'),
    ['uk-icon-check', 'uk-margin-left'],
    () => {
      this.events.dispatch('onDelete', [this.name]);
    }
  ));
  this.item.appendChild(this.renderIcon(
    _t('', 'Отмена'),
    ['uk-icon-mail-reply', 'uk-margin-left'],
    () => {
      this.state.isDeleting = false;
      this.render();
    }
  ));
};

StrategiesListItem.prototype.render = function () {
  if (!this.item) {
    this.item = document.createElement('li');
  } else {
    clearNode(this.item);
  }

  if (this.state.isEditing) {
    this.renderEditing();
  } else if (this.state.isDeleting) {
    this.renderDeleting();
  } else {
    this.renderShowing();
  }

  return this.item;
};

StrategiesListItem.prototype.listen = function (event, listener) {
  this.events.listen(event, listener);

  return this;
};

export {
  DEFAULT_STRATEGIES,
  DEFAULT_STRATEGY,
  DEFAULT_STRATEGY_NAME,
  EMPTY_STRATEGY,
  MODAL_CONTAINERS_MAP,
  MODAL_TYPES,
  StrategiesContainer,
  StrategiesList,
  StrategiesListItem,
};
