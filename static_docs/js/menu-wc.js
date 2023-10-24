'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">common documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/WisdomModule.html" data-type="entity-link" >WisdomModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-WisdomModule-1a1211273f0ca0e428ef8cd743953b2b067e398a225d2c412ddb8221e3dd1ebda63b26e06a47fe4f0cbf016f2e1c87de34490bd233393cd21cec6d0c349a9a30"' : 'data-bs-target="#xs-components-links-module-WisdomModule-1a1211273f0ca0e428ef8cd743953b2b067e398a225d2c412ddb8221e3dd1ebda63b26e06a47fe4f0cbf016f2e1c87de34490bd233393cd21cec6d0c349a9a30"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-WisdomModule-1a1211273f0ca0e428ef8cd743953b2b067e398a225d2c412ddb8221e3dd1ebda63b26e06a47fe4f0cbf016f2e1c87de34490bd233393cd21cec6d0c349a9a30"' :
                                            'id="xs-components-links-module-WisdomModule-1a1211273f0ca0e428ef8cd743953b2b067e398a225d2c412ddb8221e3dd1ebda63b26e06a47fe4f0cbf016f2e1c87de34490bd233393cd21cec6d0c349a9a30"' }>
                                            <li class="link">
                                                <a href="components/BreadcrumbsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BreadcrumbsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DragDropComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DragDropComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/IfcComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IfcComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/IonIconComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IonIconComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MapComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MapComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#directives-links-module-WisdomModule-1a1211273f0ca0e428ef8cd743953b2b067e398a225d2c412ddb8221e3dd1ebda63b26e06a47fe4f0cbf016f2e1c87de34490bd233393cd21cec6d0c349a9a30"' : 'data-bs-target="#xs-directives-links-module-WisdomModule-1a1211273f0ca0e428ef8cd743953b2b067e398a225d2c412ddb8221e3dd1ebda63b26e06a47fe4f0cbf016f2e1c87de34490bd233393cd21cec6d0c349a9a30"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-WisdomModule-1a1211273f0ca0e428ef8cd743953b2b067e398a225d2c412ddb8221e3dd1ebda63b26e06a47fe4f0cbf016f2e1c87de34490bd233393cd21cec6d0c349a9a30"' :
                                        'id="xs-directives-links-module-WisdomModule-1a1211273f0ca0e428ef8cd743953b2b067e398a225d2c412ddb8221e3dd1ebda63b26e06a47fe4f0cbf016f2e1c87de34490bd233393cd21cec6d0c349a9a30"' }>
                                        <li class="link">
                                            <a href="directives/BulmaCalendarDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BulmaCalendarDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/BulmaIsToggleableDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BulmaIsToggleableDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/DragDropDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DragDropDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/ErrorHttpContextToken.html" data-type="entity-link" >ErrorHttpContextToken</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/BreadcrumbsService.html" data-type="entity-link" >BreadcrumbsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DragDropService.html" data-type="entity-link" >DragDropService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/IfcService.html" data-type="entity-link" >IfcService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LoaderInjector.html" data-type="entity-link" >LoaderInjector</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MapService.html" data-type="entity-link" >MapService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/QueryParameterGuard.html" data-type="entity-link" >QueryParameterGuard</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Breadcrumb.html" data-type="entity-link" >Breadcrumb</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IfcDB.html" data-type="entity-link" >IfcDB</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LayerData.html" data-type="entity-link" >LayerData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MapDB.html" data-type="entity-link" >MapDB</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Marker.html" data-type="entity-link" >Marker</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ShapeData.html" data-type="entity-link" >ShapeData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WisdomInterface.html" data-type="entity-link" >WisdomInterface</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});