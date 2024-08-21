import type { ICellRendererParams } from 'ag-grid-community';

import { markdownToHtml } from '$lib/utils';

export function markdownRenderer(params: ICellRendererParams): HTMLElement {
	const eGui = document.createElement('div');
	eGui.classList.add('ag-cell-custom-renderer');
	eGui.innerHTML = markdownToHtml(params.value);
	return eGui;
}
