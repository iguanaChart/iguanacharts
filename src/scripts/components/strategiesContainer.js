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

export function StrategiesContainer(strategiesList) {
  if (!(strategiesList instanceof StrategiesList)) {
    throw new Error('StrategiesList was expected');
  }

  this.strategiesList = strategiesList;
}

StrategiesContainer.prototype.render = function () {
  const container = document.createElement('div');
  const header = document.createElement('h4');

  container.classList.add('js-chartTADialogContainerStrategies');
  header.innerText = _t('', 'Выбор стратегии');

  container.appendChild(header);
  container.appendChild(
    this.strategiesList.render()
  );

  return container;
};

export function StrategiesList() {
  this.items = [];
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
  const icon = document.createElement('i');

  text.innerText = _t('', 'Добавить стратегию');
  icon.classList.add('uk-icon-plus', 'uk-margin-left');

  item.appendChild(text);
  item.appendChild(icon);

  return item;
};

StrategiesList.prototype.render = function () {
  const list = document.createElement('ul');

  list.classList.add('uk-list', 'uk-list-line');

  this.items.forEach(item => list.appendChild(item.render()));

  // @todo "10" to constant
  if (this.items.length < 10) {
    list.appendChild(this.renderAddItem());
  }

  return list;
};

export function StrategiesListItem(name, icons) {
  if (!name) {
    throw new Error('Name is required');
  }

  this.name = name;
  this.icons = icons;
}

StrategiesListItem.prototype.renderIcon = function (title, classNames) {
  const icon = document.createElement('i');

  icon.title = title;
  icon.classList.add(...classNames);

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
      ['uk-icon-pencil', 'uk-margin-left']
    ));
    item.appendChild(this.renderIcon(
      _t('', 'Удалить'),
      ['uk-icon-remove', 'uk-margin-left']
    ));
  }

  return item;
};
