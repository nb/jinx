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
			},

			events: {
				'click' : 'onClick'
			},

			onClick: function( event ) {
				event.preventDefault();
				this.model.set( 'blushing', !this.model.get( 'blushing' ) );
			},

			render: function() {
				var template = _.template( '<p <%if (blushing) { %>class="blushing"<% } %> > <%= text %></p>');
				this.$el.html( template( this.model.toJSON() ) );
				return this;
			},
		}),

		JinxCollection: Backbone.Collection.extend( {
			model: Jinx.JinxModel,
			initialize: function( options ) {
				Jinx.collectionBlushLimiter.limit( this );
			}
		}),

		JinxCollectionView: Backbone.View.extend( {
			collection: Jinx.JinxCollection,

			className: 'jinx-collection-view',

			initialize: function( options ) {
				this.listenTo( this.collection, 'add', this.addOne );
				this.listenTo( this.collection, 'reset', this.addAll );
			},

			render: function() {
				this.collection.forEach( this.addOne, this );
				return this;
			},

			addOne: function( jinxmodel ) {
				var jinxView = new Jinx.JinxView( { model: jinxmodel } );
				this.$el.append( jinxView.render().el );
			},

			addAll: function() {
				this.collection.forEach( this.addOne, this );
			}
		}),


		collectionBlushLimiter: _.extend( Backbone.Events, {
			limit: function(collection) {
				collection.on( 'add', this.addModel, this );
			},
			addModel: function(model) {
				var limiter = this;
				model.on( 'change:blushing', function( model, blushing ) {
					if ( blushing ) {
						limiter.trigger( 'unblush-others' );
					}
				} );
				this.on( 'unblush-others', function() {
					if ( !model._changing  ) {
						model.set( 'blushing', false );
					}
				} );
			}
		} ),

		JinxApp: Backbone.Router.extend( {
			initialize: function() {


				this.jinxCollectionA = new Jinx.JinxCollection();
				this.jinxCollectionA.add( new Jinx.JinxModel( { checked: false, text: 'A1' } ) );
				this.jinxCollectionA.add( new Jinx.JinxModel( { checked: false, text: 'A2' } ) );
				this.jinxCollectionA.add( new Jinx.JinxModel( { checked: false, text: 'A3' } ) );
				this.jinxCollectionViewA = new Jinx.JinxCollectionView( { collection: this.jinxCollectionA } );
				this.jinxCollectionViewA.render();

				this.jinxCollectionB = new Jinx.JinxCollection();
				this.jinxCollectionB.add( new Jinx.JinxModel( { checked: false, text: 'B1' } ) );
				this.jinxCollectionB.add( new Jinx.JinxModel( { checked: false, text: 'B2' } ) );
				this.jinxCollectionB.add( new Jinx.JinxModel( { checked: false, text: 'B3' } ) );
				this.jinxCollectionViewB = new Jinx.JinxCollectionView( { collection: this.jinxCollectionB } );
				this.jinxCollectionViewB.render();

				$( '#content' ).html( this.jinxCollectionViewA.el );
				$( '#content' ).append( this.jinxCollectionViewB.el );
			},
		})
	};

	jinxApp = new Jinx.JinxApp();
});
