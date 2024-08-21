import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import type { ComponentProps, ComponentType, SvelteComponent } from 'svelte';

export function svelteRenderer<TValue, C extends SvelteComponent>(
	component: ComponentType<C>,
	className: string,
	computeProps: (data: TValue | null | undefined) => ComponentProps<C>,
) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type RendererParams = ICellRendererParams<any, TValue>;

	return class implements ICellRendererComp<TValue> {
		container!: HTMLElement;
		instance!: C;

		init(params: RendererParams) {
			this.container = document.createElement('div');
			this.container.className = className;
			this.instance = new component({
				target: this.container,
				props: computeProps(params.value),
			});
		}

		getGui() {
			return this.container;
		}

		destroy() {
			this.instance.$destroy();
		}

		refresh(params: RendererParams) {
			this.instance.$set(computeProps(params.value));
			return true;
		}
	};
}
