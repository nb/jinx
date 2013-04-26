/*
 * script.js
 */

window.Jinx = window.Jinx || {};

var jinxApp;

jQuery( document ).ready( function( $ ) {

  Jinx = {

		JinxModel: Backbone.Model.extend( {
			defaults: function() {
				return {
					'blushing' : false,
					'text' : ''
				};
			}
		}),

		JinxView: Backbone.View.extend( {
			model: Jinx.JinxModel,

			className: 'jinx-view',

			initialize: function( options ) {
				this.listenTo( this.model, 'change', this.render );
				this.vent = options.vent;
				this.vent.bind( "jinxview:unblush", this.unBlush, this );
			},

			events: {
				'click' : 'onClick'
			},

			onClick: function( event ) {
				event.preventDefault();
				if ( this.model.get( 'blushing' ) == false ) {
					// If we are currently unblushed, ask app to clear anyone else before we blush ourselves
					this.vent.trigger( 'jinxview:unblush' /*'jinxapp:unblushall'*/, false ); // we could pass a reference to this.model instead of false if we wanted to
					this.model.set( { 'blushing': true } );
				} else {
					this.model.set( { 'blushing': false } );
				}
			},

			unBlush: function( event ) {
				if ( this.model.get( 'blushing' ) ) {
					this.model.set( { 'blushing': false } );
				}
			},

			render: function() {
				var template = _.template( '<p <%if (blushing) { %>class="blushing"<% } %> > <%= text %></p>');
				this.$el.html( template( this.model.toJSON() ) );
				return this;
			},
		}),

		JinxCollection: Backbone.Collection.extend( {
			model: Jinx.JinxModel
		}),

		JinxCollectionView: Backbone.View.extend( {
			collection: Jinx.JinxCollection,

			className: 'jinx-collection-view',

			initialize: function( options ) {
				this.listenTo( this.collection, 'add', this.addOne );
				this.listenTo( this.collection, 'reset', this.addAll );
				this.vent = options.vent;
			},

			render: function() {
				this.collection.forEach( this.addOne, this );
				return this;
			},

			addOne: function( jinxmodel ) {
				var jinxView = new Jinx.JinxView( { model: jinxmodel, vent: this.vent } );
				this.$el.append( jinxView.render().el );
			},

			addAll: function() {
				this.collection.forEach( this.addOne, this );
			}
		}),

		JinxApp: Backbone.Router.extend( {
			initialize: function() {

				this.vent = _.extend({}, Backbone.Events);

				this.jinxCollectionA = new Jinx.JinxCollection();
				this.jinxCollectionA.add( new Jinx.JinxModel( { checked: false, text: 'A1' } ) );
				this.jinxCollectionA.add( new Jinx.JinxModel( { checked: false, text: 'A2' } ) );
				this.jinxCollectionA.add( new Jinx.JinxModel( { checked: false, text: 'A3' } ) );
				this.jinxCollectionViewA = new Jinx.JinxCollectionView( { collection: this.jinxCollectionA, vent: this.vent } );
				this.jinxCollectionViewA.render();

				this.jinxCollectionB = new Jinx.JinxCollection();
				this.jinxCollectionB.add( new Jinx.JinxModel( { checked: false, text: 'B1' } ) );
				this.jinxCollectionB.add( new Jinx.JinxModel( { checked: false, text: 'B2' } ) );
				this.jinxCollectionB.add( new Jinx.JinxModel( { checked: false, text: 'B3' } ) );
				this.jinxCollectionViewB = new Jinx.JinxCollectionView( { collection: this.jinxCollectionB, vent: this.vent } );
				this.jinxCollectionViewB.render();

				$( '#content' ).html( this.jinxCollectionViewA.el );
				$( '#content' ).append( this.jinxCollectionViewB.el );

				this.vent.bind( "jinxapp:unblushall", this.unblushAll, this );
			},

			unblushAll: function( event ) {
				this.vent.trigger( 'jinxview:unblush', false ); // instead of false, we could pass this, but the view doesn't really need it
			}
		})
	};

	jinxApp = new Jinx.JinxApp();
});
