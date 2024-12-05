var Embed = Quill.import('blots/block/embed');

class Divider extends Embed {
    static create(value) {
        let node = super.create(value);
        node.setAttribute('style', "height: 0px; margin-top: 0.5em 0; border-width; 1px; border-style: solid none none none;");
        return node;
    }
}

Divider.blotName = 'hr';
Divider.tagName = 'hr';
Quill.register(Divider, true);

try {
    Quill.register('modules/blotFormatter', QuillBlotFormatter.default);
} catch { }

export function createQuillInterop(dotNetRef, editorRef, toolbarRef, placeholder, readOnly) {
    var quill = new Quill(editorRef, {
        modules: {
            toolbar: {
                container: toolbarRef
            },
            blotFormatter: {}
        },
        readOnly: readOnly,
        placeholder: readOnly ? "" : placeholder,
        theme: 'snow'
    });
    return new MudQuillInterop(dotNetRef, quill, editorRef, toolbarRef);
}

export class MudQuillInterop {
    /**
     * @param {Quill} quill
     * @param {Element} editorRef
     * @param {Element} toolbarRef
     */
    constructor(dotNetRef, quill, editorRef, toolbarRef) {
        var toolbar = quill.getModule('toolbar');
        toolbar.addHandler('hr', this.insertDividerHandler);
        quill.on('text-change', this.textChangedHandler);
        toolbar.container.addEventListener("mousedown", this.toolbarMouseDownHandler);
        quill.on('selection-change', this.selectionChangedHandler);
        this.dotNetRef = dotNetRef;
        this.quill = quill;
        this.editorRef = editorRef;
        this.toolbarRef = toolbarRef;
    }

    getText = () => {
        return this.quill.getText();
    };

    getHtml = () => {
        return this.quill.root.innerHTML;
    };

    setHtml = (html) => {
        this.quill.root.innerHTML = html;
    }

    focus = () => {
        this.quill.focus();
    }

    hasFocus = () => {
        return this.quill.hasFocus();
    }

    enableEditor = (enable) => {
        this.quill.enable(enable);
        if (!enable) {
            this.quill.root.placeholder = "";
            this.quill.getModule('toolbar').container.classList.add('hidden');
        }
        else {
            this.quill.getModule('toolbar').container.classList.remove('hidden');
        }
    }

    insertDividerHandler = () => {
        const range = this.quill.getSelection();

        if (range) {
            this.quill.insertEmbed(range.index, "hr", "null");
        }
    };

    /**
     * 
     * @param {Delta} delta
     * @param {Delta} oldDelta
     * @param {any} source
     */
    textChangedHandler = (delta, oldDelta, source) => {
        this.dotNetRef.invokeMethodAsync('HandleHtmlContentChanged', this.getHtml());
        this.dotNetRef.invokeMethodAsync('HandleTextContentChanged', this.getText());
    };

    selectionChangedHandler = (range, oldRange, source) => {
        if (range === null && oldRange !== null && this.hasFocus() == false) {
            this.dotNetRef.invokeMethodAsync('HandleBlur');
        }
    };

    toolbarMouseDownHandler = (e) => {
        e.preventDefault();
    };

}