(function( window ) {
    'use strict';

    var Todo = window.Todo || (window.Todo = {View: {}}),
        View = Todo.View;
    
    var Main = new Class({
        Extends: Neuro.View,

        items: {},

        options: {
            todoItemTemplate:'',

            elements: {
                toggleAll: 'toggle-all',
                list: 'todo-list'
            },

            events: {
                'click:relay(#toggle-all)': '_onClickComplete'
            }
        },

        /**
         * Setup the View and reference the toggleAll and List elements.
         * @param  {Object} options Options to setup the view.
         * @return {Object} The class instance.
         */
        setup: function(options){
            this.parent(options);

            this.elements = {
                toggleAll: document.id(this.options.elements.toggleAll),
                list: document.id(this.options.elements.list)
            };

            return this;
        },

        /**
         * Show the element.
         * @return {Object} The class instance.
         */
        showMain: function(){
            this.element.removeClass('hidden');

            return this;
        },

        /**
         * Hide the element
         * @return {Object} The class instance.
         */
        hideMain: function(){
            this.element.addClass('hidden');

            return this;
        },

        /**
         * Toggle hide/show of the element
         * @param  {Boolean} bool Boolean used to determine whether to trigger hide or show methods
         * @return {[type]}      [description]
         */
        toggleMain: function(bool){
            this[(bool ? 'show' : 'hide') + 'Main']();

            return this;
        },

        /**
         * Process the model to create/render the ToDo Item View.
         * @param {Object} model The model used to generate the ToDo List Item view.
         * @return {Object} The class instance.
         */
        addTodo: function(model){
            var id = model.get('id'),
                todoItem = new View.TodoListItem({
                    template: this.options.todoItemTemplate
                });

            // Connect the view with the model both ways.
            todoItem.connect(model, true);

            // Store todoItem view
            this.items[id] = todoItem;

            // Render the view with the model data.
            todoItem.render(model);

            return this;
        },

        /**
         * Remove the view from the items array based on the model's id.
         * @param  {Object} model The model used to reference the view.
         * @return {Object} The class instance.
         */
        removeTodo: function(model){
            var id = model.get('id');

            delete this.items[id];

            return this;
        },

        /**
         * Uncheck the Completed checkbox
         * @return {Object} The class instance.
         */
        uncheckCompleted: function(){
            this.elements.toggleAll.set('checked');

            return this;
        },

        /**
         * Check the Completed checkbox
         * @return {Object} The class instance.
         */
        checkCompleted: function(){
            this.elements.toggleAll.set('checked', 'checked');

            return this;
        },

        /**
         * Toggle Completed checkbox
         * @param  {Boolean} bool Boolean value used trigger the check/uncheckCompleted method.
         * @return {Object} This class instance.
         */
        toggleCompleted: function(bool){
            this[(bool ? '' : 'un') + 'checkCompleted']();

            return this;
        },

        /**
         * Render the view. Does not create new elements. Does not throw away elements.
         * @param  {Object} collection The collection object used for rendering.
         * @param  {String} filterType The string used to filter the collections models for display.
         * @return {Object} The class instance.
         */
        render: function(collection, filterType){
                // Count the number of completed items in the collection
            var completeCount = collection.countCompleted(),
                count = collection.length,
                models = collection.filterBy(filterType),
                list = this.elements.list, items;

            // Check/uncheck the completed checkbox based on whether citems in the collection are compeleted or not
            this.toggleCompleted(completeCount == count);

            // Show/hide the element based on the count
            this.toggleMain(count);

            // Retrieve the elements from the collection by filter
            // elements = collection.filterBy(filterType).invoke('get', 'view');
            items = models.map(function(model){
                var id = model.get('id');

                return this.items[id];
            }, this);

            // Prepare the list element by emptying it first.
            list.empty();

            // Update the list only if there are items
            if (items.length) {
                // Have the list element adopt all the elements that have been filtered from the collection
                list.adopt(items);
            }

            // Execute the parent method, which will trigger the render event.
            return this.parent.apply(this, arguments);
        },

        _onClickComplete: function(e, element){
            var checked = element.get('checked');

            this.fireEvent('clickComplete', checked);

            return this;
        }
    });
    
    View.Main = Main;

})( window );