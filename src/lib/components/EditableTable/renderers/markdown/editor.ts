import { Editor } from '@tiptap/core';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import Link from '@tiptap/extension-link';
import StarterKit from '@tiptap/starter-kit';
import type { ICellEditorComp, ICellEditorParams } from 'ag-grid-community';

import { htmlToMarkdown,markdownToHtml } from '$lib/utils';

import TipTapBubbleMenu from './TipTapBubbleMenu.svelte';

export class MarkdownEditor implements ICellEditorComp {
	container!: HTMLDivElement;
	params!: ICellEditorParams;
	editor!: Editor;
	bubbleMenu!: TipTapBubbleMenu;

	init(params: ICellEditorParams) {
		this.params = params;

		this.container = document.createElement('div');

		this.container.classList.add('ag-cell-custom-editor');
		this.container.style.width = params.column.getActualWidth() + 'px';
		this.container.style.paddingLeft = '16px';
		this.container.style.paddingRight = '16px';
		this.container.style.backgroundColor = 'white';

		const bubbleMenuElement = document.createElement('div');

		this.editor = new Editor({
			element: this.container,
			extensions: [
				StarterKit,
				Link.configure({ protocols: ['mailto', 'https'], openOnClick: false }),
				BubbleMenu.configure({ element: bubbleMenuElement }),
			],
			content: markdownToHtml(params.value),
			onTransaction: () => {
				this.bubbleMenu.$set({ editor: this.editor });
			},
		});

		this.bubbleMenu = new TipTapBubbleMenu({
			target: bubbleMenuElement,
			props: { editor: this.editor },
		});

		this.container.addEventListener('keydown', (e) => e.stopPropagation());
	}

	isPopup() {
		return true;
	}

	getPopupPosition() {
		return 'over' as const;
	}

	getGui() {
		return this.container;
	}

	getValue() {
		return htmlToMarkdown(this.editor.getHTML());
	}

	afterGuiAttached() {
		if (this.params.eventKey === null || this.params.eventKey === 'Enter')
			this.editor.commands.focus('all');
		else {
			if (this.params.eventKey.length === 1) this.editor.commands.setContent(this.params.eventKey);
			this.editor.commands.focus('end');
		}
	}

	destroy() {
		this.editor.destroy();
		this.bubbleMenu.$destroy();
	}

	refresh() {
		throw new Error('Method not implemented.');
	}
}
