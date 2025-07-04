var MenuManager = pc.createScript('menu');

MenuManager.prototype.initialize = function() {
    console.log("🎮 Menu Manager iniciando...");
    
    // Estados del juego
    this.estado = 'menu'; // 'menu' o 'jugando'
    
    // Referencias a scripts del juego
    this.jugadorScript = null;
    this.villanoScript = null;
    
    // Elementos del menú y juego
    this.elementosMenu = [];
    this.elementosJuego = [];
    
    // Variables de control
    this.menuActivo = false;
    this.juegoIniciado = false;
    
    // Inicializar después de un momento
    var self = this;
    setTimeout(function() {
        self.configurarInicial();
    }, 300);
};

MenuManager.prototype.configurarInicial = function() {
    console.log("⚙️ Configurando estado inicial...");
    
    // Buscar y configurar scripts
    this.buscarScripts();
    
    // Guardar elementos del juego para poder ocultarlos
    this.guardarElementosJuego();
    
    // Crear menú visual
    this.crearMenuVisual();
    
    // Configurar controles
    this.configurarControles();
    
    // Mostrar menú inicial
    this.activarMenu();
    
    console.log("✅ Menu Manager configurado correctamente");
};

MenuManager.prototype.buscarScripts = function() {
    // Buscar script del jugador (Box con script 'movimiento')
    var jugador = this.app.root.findByName('Box');
    if (jugador && jugador.script) {
        // Buscar el script por nombre
        if (jugador.script.movimiento) {
            this.jugadorScript = jugador.script.movimiento;
            console.log("✅ Script del jugador encontrado");
        } else {
            console.log("⚠️ No se encontró script 'movimiento' en Box");
        }
    } else {
        console.log("⚠️ No se encontró Box o no tiene componente script");
    }
    
    // Buscar script del villano (Box2 con script 'villano')
    var villano = this.app.root.findByName('Box2');
    if (villano && villano.script) {
        if (villano.script.villano) {
            this.villanoScript = villano.script.villano;
            console.log("✅ Script del villano encontrado");
        } else {
            console.log("⚠️ No se encontró script 'villano' en Box2");
        }
    } else {
        console.log("⚠️ No se encontró Box2 o no tiene componente script");
    }
};

MenuManager.prototype.guardarElementosJuego = function() {
    // Buscar elementos principales del juego
    var elementos = ['Box', 'Box2', 'Plane'];
    
    for (var i = 0; i < elementos.length; i++) {
        var elemento = this.app.root.findByName(elementos[i]);
        if (elemento) {
            this.elementosJuego.push(elemento);
            console.log("📦 Elemento encontrado:", elementos[i]);
        }
    }
    
    // También buscar otros elementos como Cylinder si existen
    var otrosElementos = this.app.root.children;
    for (var j = 0; j < otrosElementos.length; j++) {
        var elem = otrosElementos[j];
        if (elem.name.indexOf('Cylinder') !== -1 || 
            elem.name.indexOf('Light') !== -1) {
            if (this.elementosJuego.indexOf(elem) === -1) {
                this.elementosJuego.push(elem);
                console.log("📦 Elemento adicional encontrado:", elem.name);
            }
        }
    }
    
    console.log("📦 Total elementos del juego guardados:", this.elementosJuego.length);
};

MenuManager.prototype.crearMenuVisual = function() {
    console.log("🎨 Creando menú visual...");
    
    // === FONDO AZUL SÓLIDO ===
    var fondo = new pc.Entity('MenuFondo');
    fondo.addComponent('render', { type: 'plane' });
    fondo.setPosition(0, 0, -5);
    fondo.setLocalScale(25, 20, 1);
    
    var materialFondo = new pc.StandardMaterial();
    materialFondo.diffuse.set(0.2, 0.4, 0.7); // Azul
    materialFondo.update();
    fondo.render.meshInstances[0].material = materialFondo;
    
    this.app.root.addChild(fondo);
    this.elementosMenu.push(fondo);
    
    // === TÍTULO "THE BOX" (Letras con cubos) ===
    this.crearTituloConCubos();
    
    // === BOTÓN PLAY ===
    var botonPlay = new pc.Entity('BotonPlay');
    botonPlay.addComponent('render', { type: 'box' });
    botonPlay.setPosition(0, -1.5, 0);
    botonPlay.setLocalScale(3, 0.8, 0.4);
    
    var materialBoton = new pc.StandardMaterial();
    materialBoton.diffuse.set(1, 0.5, 0); // Naranja
    materialBoton.emissive.set(0.2, 0.1, 0);
    materialBoton.update();
    botonPlay.render.meshInstances[0].material = materialBoton;
    
    this.app.root.addChild(botonPlay);
    this.elementosMenu.push(botonPlay);
    this.botonPlay = botonPlay;
    
    // === TEXTO "CLICK TO PLAY" ===
    var textoClick = new pc.Entity('TextoClick');
    textoClick.addComponent('render', { type: 'plane' });
    textoClick.setPosition(0, -2.8, 0);
    textoClick.setLocalScale(4, 0.6, 1);
    
    var materialTexto = new pc.StandardMaterial();
    materialTexto.diffuse.set(1, 1, 1); // Blanco
    materialTexto.emissive.set(0.3, 0.3, 0.3);
    materialTexto.update();
    textoClick.render.meshInstances[0].material = materialTexto;
    
    this.app.root.addChild(textoClick);
    this.elementosMenu.push(textoClick);
    
    console.log("✅ Menú visual creado con", this.elementosMenu.length, "elementos");
};

MenuManager.prototype.crearTituloConCubos = function() {
    // Crear "THE BOX" con cubos individuales para que se vea como texto
    var letras = [
        // T
        {x: -4, y: 1, w: 0.6, h: 0.3, d: 0.3},
        {x: -4, y: 1.5, w: 0.3, h: 0.3, d: 0.3},
        {x: -4, y: 2, w: 0.3, h: 0.3, d: 0.3},
        {x: -4.3, y: 2, w: 0.3, h: 0.3, d: 0.3},
        {x: -3.7, y: 2, w: 0.3, h: 0.3, d: 0.3},
        
        // H
        {x: -3, y: 1, w: 0.3, h: 0.3, d: 0.3},
        {x: -3, y: 1.5, w: 0.3, h: 0.3, d: 0.3},
        {x: -3, y: 2, w: 0.3, h: 0.3, d: 0.3},
        {x: -2.4, y: 1, w: 0.3, h: 0.3, d: 0.3},
        {x: -2.4, y: 1.5, w: 0.3, h: 0.3, d: 0.3},
        {x: -2.4, y: 2, w: 0.3, h: 0.3, d: 0.3},
        {x: -2.7, y: 1.5, w: 0.3, h: 0.3, d: 0.3},
        
        // E
        {x: -1.8, y: 1, w: 0.3, h: 0.3, d: 0.3},
        {x: -1.8, y: 1.5, w: 0.3, h: 0.3, d: 0.3},
        {x: -1.8, y: 2, w: 0.3, h: 0.3, d: 0.3},
        {x: -1.5, y: 1, w: 0.3, h: 0.3, d: 0.3},
        {x: -1.5, y: 1.5, w: 0.3, h: 0.3, d: 0.3},
        {x: -1.5, y: 2, w: 0.3, h: 0.3, d: 0.3},
        
        // Espacio
        
        // B
        {x: -0.5, y: 1, w: 0.3, h: 0.3, d: 0.3},
        {x: -0.5, y: 1.5, w: 0.3, h: 0.3, d: 0.3},
        {x: -0.5, y: 2, w: 0.3, h: 0.3, d: 0.3},
        {x: -0.2, y: 1, w: 0.3, h: 0.3, d: 0.3},
        {x: -0.2, y: 1.5, w: 0.3, h: 0.3, d: 0.3},
        {x: -0.2, y: 2, w: 0.3, h: 0.3, d: 0.3},
        
        // O
        {x: 0.5, y: 1, w: 0.3, h: 0.3, d: 0.3},
        {x: 0.5, y: 1.5, w: 0.3, h: 0.3, d: 0.3},
        {x: 0.5, y: 2, w: 0.3, h: 0.3, d: 0.3},
        {x: 1.1, y: 1, w: 0.3, h: 0.3, d: 0.3},
        {x: 1.1, y: 1.5, w: 0.3, h: 0.3, d: 0.3},
        {x: 1.1, y: 2, w: 0.3, h: 0.3, d: 0.3},
        {x: 0.8, y: 1, w: 0.3, h: 0.3, d: 0.3},
        {x: 0.8, y: 2, w: 0.3, h: 0.3, d: 0.3},
        
        // X
        {x: 1.8, y: 1, w: 0.3, h: 0.3, d: 0.3},
        {x: 1.8, y: 2, w: 0.3, h: 0.3, d: 0.3},
        {x: 2.4, y: 1, w: 0.3, h: 0.3, d: 0.3},
        {x: 2.4, y: 2, w: 0.3, h: 0.3, d: 0.3},
        {x: 2.1, y: 1.5, w: 0.3, h: 0.3, d: 0.3}
    ];
    
    // Material blanco brillante para las letras
    var materialLetra = new pc.StandardMaterial();
    materialLetra.diffuse.set(1, 1, 1); // Blanco
    materialLetra.emissive.set(0.4, 0.4, 0.4); // Brillo
    materialLetra.update();
    
    // Crear cada cubo de letra
    for (var i = 0; i < letras.length; i++) {
        var letra = letras[i];
        var cubo = new pc.Entity('Letra' + i);
        cubo.addComponent('render', { type: 'box' });
        cubo.setPosition(letra.x, letra.y, 0);
        cubo.setLocalScale(letra.w, letra.h, letra.d);
        cubo.render.meshInstances[0].material = materialLetra;
        
        this.app.root.addChild(cubo);
        this.elementosMenu.push(cubo);
    }
};

MenuManager.prototype.configurarControles = function() {
    var self = this;
    
    // Click del mouse para iniciar juego
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, function(event) {
        if (self.estado === 'menu') {
            console.log("🖱️ Click detectado - Iniciando juego");
            self.iniciarJuego();
        }
    });
    
    // Touch para dispositivos móviles
    if (this.app.touch) {
        this.app.touch.on(pc.EVENT_TOUCHSTART, function(event) {
            if (self.estado === 'menu') {
                console.log("👆 Touch detectado - Iniciando juego");
                self.iniciarJuego();
            }
        });
    }
    
    console.log("🎮 Controles configurados");
};

MenuManager.prototype.activarMenu = function() {
    console.log("📋 Activando menú...");
    
    this.estado = 'menu';
    this.menuActivo = true;
    
    // Configurar cámara para el menú
    this.configurarCamaraMenu();
    
    // Ocultar elementos del juego
    this.ocultarElementosJuego();
    
    // Mostrar elementos del menú
    this.mostrarElementosMenu();
    
    // Pausar scripts del juego
    this.pausarScriptsJuego();
    
    // Iniciar animaciones del menú
    this.iniciarAnimacionesMenu();
    
    console.log("✅ Menú activo - Click para iniciar THE BOX");
};

MenuManager.prototype.iniciarJuego = function() {
    console.log("🎮 ¡Iniciando THE BOX!");
    
    this.estado = 'jugando';
    this.menuActivo = false;
    this.juegoIniciado = true;
    
    // Ocultar menú
    this.ocultarElementosMenu();
    
    // Mostrar elementos del juego
    this.mostrarElementosJuego();
    
    // Configurar cámara para el juego
    this.configurarCamaraJuego();
    
    // Reiniciar posiciones del juego
    this.reiniciarPosicionesJuego();
    
    // Activar scripts del juego
    this.activarScriptsJuego();
    
    console.log("✅ THE BOX iniciado - Usa WASD + SPACE para jugar");
};

MenuManager.prototype.configurarCamaraMenu = function() {
    var camera = this.app.root.findByName('Camera');
    if (camera) {
        camera.setPosition(0, 2, 8);
        camera.setEulerAngles(-10, 0, 0);
        console.log("📸 Cámara configurada para menú");
    }
};

MenuManager.prototype.configurarCamaraJuego = function() {
    var camera = this.app.root.findByName('Camera');
    if (camera) {
        camera.setPosition(0, 4, 10);
        camera.setEulerAngles(-15, 0, 0);
        console.log("📸 Cámara configurada para juego");
    }
};

MenuManager.prototype.reiniciarPosicionesJuego = function() {
    // Reiniciar jugador
    var jugador = this.app.root.findByName('Box');
    if (jugador) {
        jugador.setPosition(0, 0.5, 0);
        console.log("🔄 Jugador reiniciado");
    }
    
    // Reiniciar villano
    var villano = this.app.root.findByName('Box2');
    if (villano) {
        villano.setPosition(5, 0.5, 0);
        console.log("🔄 Villano reiniciado");
    }
    
    // Limpiar proyectiles si el villano tiene ese método
    if (this.villanoScript && typeof this.villanoScript.destruirTodosProyectiles === 'function') {
        this.villanoScript.destruirTodosProyectiles();
        console.log("🔄 Proyectiles limpiados");
    }
};

MenuManager.prototype.iniciarAnimacionesMenu = function() {
    if (this.animacionMenu) {
        clearInterval(this.animacionMenu);
    }
    
    var self = this;
    var tiempo = 0;
    
    this.animacionMenu = setInterval(function() {
        if (!self.menuActivo || self.estado !== 'menu') {
            clearInterval(self.animacionMenu);
            return;
        }
        
        tiempo += 0.05;
        
        // Animar el botón PLAY
        if (self.botonPlay) {
            var escala = 1 + Math.sin(tiempo * 3) * 0.1;
            self.botonPlay.setLocalScale(3 * escala, 0.8 * escala, 0.4);
            
            // Cambiar brillo
            var material = self.botonPlay.render.meshInstances[0].material;
            var brillo = 0.1 + Math.sin(tiempo * 4) * 0.2;
            material.emissive.set(brillo * 2, brillo, 0);
            material.update();
        }
        
    }, 50);
};

// === CONTROL DE ELEMENTOS ===

MenuManager.prototype.ocultarElementosJuego = function() {
    for (var i = 0; i < this.elementosJuego.length; i++) {
        this.elementosJuego[i].enabled = false;
    }
    console.log("🙈 Elementos del juego ocultados");
};

MenuManager.prototype.mostrarElementosJuego = function() {
    for (var i = 0; i < this.elementosJuego.length; i++) {
        this.elementosJuego[i].enabled = true;
    }
    console.log("👁️ Elementos del juego mostrados");
};

MenuManager.prototype.ocultarElementosMenu = function() {
    for (var i = 0; i < this.elementosMenu.length; i++) {
        this.elementosMenu[i].enabled = false;
    }
    
    if (this.animacionMenu) {
        clearInterval(this.animacionMenu);
    }
    
    console.log("🙈 Elementos del menú ocultados");
};

MenuManager.prototype.mostrarElementosMenu = function() {
    for (var i = 0; i < this.elementosMenu.length; i++) {
        this.elementosMenu[i].enabled = true;
    }
    console.log("👁️ Elementos del menú mostrados");
};

// === CONTROL DE SCRIPTS ===

MenuManager.prototype.pausarScriptsJuego = function() {
    if (this.jugadorScript) {
        this.jugadorScript.enabled = false;
        console.log("⏸️ Script del jugador pausado");
    }
    if (this.villanoScript) {
        this.villanoScript.enabled = false;
        console.log("⏸️ Script del villano pausado");
    }
};

MenuManager.prototype.activarScriptsJuego = function() {
    if (this.jugadorScript) {
        this.jugadorScript.enabled = true;
        console.log("▶️ Script del jugador activado");
    } else {
        console.log("⚠️ No se puede activar script del jugador - no encontrado");
    }
    
    if (this.villanoScript) {
        this.villanoScript.enabled = true;
        console.log("▶️ Script del villano activado");
    } else {
        console.log("⚠️ No se puede activar script del villano - no encontrado");
    }
};

// === MÉTODOS PÚBLICOS ===

MenuManager.prototype.estaJugando = function() {
    return this.estado === 'jugando' && this.juegoIniciado;
};

// MÉTODO QUE NECESITA EL SCRIPT DE MOVIMIENTO
MenuManager.prototype.juegoActivo = function() {
    return this.estado === 'jugando' && this.juegoIniciado;
};

MenuManager.prototype.volverAlMenu = function() {
    console.log("🏠 Volviendo al menú...");
    this.activarMenu();
};

MenuManager.prototype.jugadorMurio = function() {
    console.log("💀 ¡Jugador ha muerto!");
    var self = this;
    setTimeout(function() {
        var reiniciar = confirm("💀 GAME OVER\n\n¿Jugar de nuevo?");
        if (reiniciar) {
            self.iniciarJuego();
        } else {
            self.volverAlMenu();
        }
    }, 500);
};

// === UPDATE ===

MenuManager.prototype.update = function(dt) {
    // Verificar tecla ESC para volver al menú
    var input = this.app.keyboard;
    if (input && input.wasPressed && input.wasPressed(pc.KEY_ESCAPE)) {
        if (this.estado === 'jugando') {
            this.volverAlMenu();
        }
    }
};