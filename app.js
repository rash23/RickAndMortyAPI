class Store {
	getState(id) {
		const store = localStorage.getItem(id);

		if (!store) {
			const initStore = {};

			localStorage.setItem(id, JSON.stringify(initStore));
			return initStore;
		}

		return JSON.parse(store);
	}

	setState(id, entity) {
		const state = this.getState(id);

		localStorage.setItem(
			id,
			JSON.stringify(Object.assign({}, state, { [entity.id]: entity }))
		);
	}
}

class BaseComponent {
	constructor(container) {
		if (!(container instanceof HTMLElement)) {
			throw new DOMError('Container not found');
		}

		this.container = container;
	}

	isHTMLElement(elem) {
		return elem instanceof HTMLElement;
	}
}

class RickAndMorthy extends BaseComponent {
	constructor(...args) {
		super(...args);
		this.root = this.container;

		this.charactersWrap = this.root.querySelector('#characters-wrap');
		this.input = this.root.querySelector('#search-input');
		this.search = this.root.querySelector('#search-btn');
		this.loadMore = this.root.querySelector('.load-more');
		this.loadMore.hidden = true;

		this.arr = [];
		this.click = 5;
		this.onReload();

		this.search.addEventListener('click', () => {
			if (this.inpValidaite(+this.input.value)) {
				this.request(
					`https://rickandmortyapi.com/api/character/${this.input.value}`
				);
			} else {
				alert('Character is not found');
			}
		});

		this.loadMore.addEventListener('click', () => {
			this.click += 5;
			this.noMoreThenFive(this.charactersWrap.children, this.click);
			window.scrollTo(0, window.outerHeight);
		});
	}

	inpValidaite(input) {
		const max = 826;
		if (/\d/.test(input) && input < max && input > 0) {
			return true;
		} else {
			return false;
		}
	}

	createImg(url) {
		let img = document.createElement('img');
		img.src = url;

		return img;
	}

	createDelBtn() {
		let delBtn = document.createElement('button');
		delBtn.innerHTML = 'Remove';
		delBtn.classList.add('remove');

		return delBtn;
	}

	createWrapper(img, btn, id) {
		let wrapper = document.createElement('div');
		wrapper.classList.add('wrapper');
		wrapper.setAttribute('num', id);
		wrapper.append(img, btn);

		this.charactersWrap.prepend(wrapper);
		return wrapper;
	}

	onReload() {
		let arr = JSON.parse(localStorage.getItem('storage'));

		if (arr !== null) {
			for (const item of Object.values(arr)) {
				this.requestOnReload(
					`https://rickandmortyapi.com/api/character/${item.obj.id}`
				);
			}
		}
	}

	process(data) {
		let isInArr = true;

		for (const child of this.charactersWrap.children) {
			if (+child.getAttribute('num') === data.id) {
				isInArr = false;
				alert('Character is already in the list');
			}
		}

		if (data.id === +this.input.value && isInArr) {
			let btn = this.createDelBtn();

			this.arr.push(data);

			new Store().setState('storage', {
				id: new Date().toTimeString(),
				obj: data
			});

			this.createWrapper(this.createImg(data.image), btn, data.id);

			this.removeButton(btn);
		}

		this.checkLoadMore(this.charactersWrap.children);
		this.noMoreThenFive(this.charactersWrap.children, this.click);
	}

	processOnReload({ image, id }) {
		let btn = this.createDelBtn();

		this.createWrapper(this.createImg(image), btn, id);
		this.removeButton(btn);
		this.noMoreThenFive(this.charactersWrap.children, this.click);
		this.checkLoadMore(this.charactersWrap.children);
	}

	checkLoadMore(wrappers) {
		let max = 5;
		if (wrappers.length > max) {
			this.loadMore.hidden = false;
		} else {
			this.loadMore.hidden = true;
		}
	}

	noMoreThenFive(elems, num) {
		let arr = Array.from(elems);
		for (const [key, value] of Object.entries(arr)) {
			if (key >= num) {
				value.style.display = 'none';
			} else {
				value.style.display = 'block';
			}
		}
	}

	removeButton(btn) {
		btn.addEventListener('click', () => {
			if (confirm('Are you sure?')) {
				btn.parentElement.remove();

				let obj = JSON.parse(localStorage.getItem('storage'));
				let delNum = btn.parentElement.getAttribute('num');

				for (let [key, value] of Object.entries(obj)) {
					if (+delNum === value.obj.id) {
						delete obj[key];
						localStorage.setItem('storage', JSON.stringify(obj));
					}
				}
			}
			this.noMoreThenFive(this.charactersWrap.children, this.click);
			this.checkLoadMore(this.charactersWrap.children);
		});
	}

	request(link) {
		fetch(link)
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				this.process(data);
				this.input.value = '';
			});
	}

	requestOnReload(link) {
		fetch(link)
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				this.processOnReload(data);
			});
	}
}

const game = new RickAndMorthy(document.getElementById('root'));
