var Movimiento = pc.createScript('movimiento');
 
Movimiento.prototype.initialize = function() {
    console.log("🎮 Inicializando script de movimiento...");
    
    this.speed = 5;
    this.jumpForce = 8;
    this.isGrounded = true;
    
    // Para detección de colisión
    this.distanciaColision = 1.5;
    this.enColision = false;
    this.otroObjeto = null;
    
    // Para simular choque
    this.fuerzaRebote = 3;
    this.tiempoRebote = 0;
    this.duracionRebote = 0.3;
    this.direccionRebote = new pc.Vec3();
    
    // BUSCAR EL MENU MANAGER
    this.menuManager = null;
    
    // Buscar box2
    var self = this;
    setTimeout(function() {
        self.otroObjeto = self.app.root.findByName('Box2');
        console.log("Movimiento - Encontró box2:", self.otroObjeto ? "SÍ" : "NO");
        
        // Buscar MenuManager
        self.buscarMenuManager();
    }, 100);
};

Movimiento.prototype.buscarMenuManager = function() {
    // Buscar entidad con script menuManager
    var entidades = this.app.root.children;
    for (var i = 0; i < entidades.length; i++) {
        var entidad = entidades[i];
        if (entidad.script && entidad.script.menuManager) {
            this.menuManager = entidad.script.menuManager;
            console.log("✅ Movimiento conectado con MenuManager");
            return;
        }
    }
    
    // Si no encuentra MenuManager, crear referencia falsa para evitar errores
    console.log("⚠️ No se encontró MenuManager - Creando referencia de respaldo");
    this.menuManager = {
        juegoActivo: function() { return true; },
        jugadorMurio: function() { console.log("Game Over"); }
    };
};
 
Movimiento.prototype.update = function(dt) {
    // VERIFICAR SI EL JUEGO ESTÁ ACTIVO
    if (this.menuManager && typeof this.menuManager.juegoActivo === 'function') {
        if (!this.menuManager.juegoActivo()) {
            return; // No procesar movimiento si el juego no está activo
        }
    }
    
    var input = this.app.keyboard;
    
    // MOVIMIENTO NORMAL (solo si no está rebotando)
    if (this.tiempoRebote <= 0) {
        if (input.isPressed(pc.KEY_W)) {
            this.entity.translate(0, 0, -this.speed * dt);
        }
        if (input.isPressed(pc.KEY_S)) {
            this.entity.translate(0, 0, this.speed * dt);
        }
        if (input.isPressed(pc.KEY_A)) {
            this.entity.translate(-this.speed * dt, 0, 0);
        }
        if (input.isPressed(pc.KEY_D)) {
            this.entity.translate(this.speed * dt, 0, 0);
        }
    }
    
    // Aplicar rebote si está ocurriendo
    if (this.tiempoRebote > 0) {
        this.entity.translate(
            this.direccionRebote.x * this.fuerzaRebote * dt,
            0,
            this.direccionRebote.z * this.fuerzaRebote * dt
        );
        this.tiempoRebote -= dt;
    }
    
    // Salto
    if (input.wasPressed(pc.KEY_SPACE) && this.isGrounded) {
        this.entity.translate(0, this.jumpForce * dt, 0);
        this.isGrounded = false;
    }
    
    // Gravedad
    if (!this.isGrounded) {
        this.entity.translate(0, -10 * dt, 0);
        if (this.entity.getPosition().y <= 0.5) {
            this.entity.setPosition(
                this.entity.getPosition().x,
                0.5,
                this.entity.getPosition().z
            );
            this.isGrounded = true;
        }
    }
    
    // Detectar colisión
    this.detectarColision();
};

// Detectar colisión y activar rebote
Movimiento.prototype.detectarColision = function() {
    if (!this.otroObjeto) return;
    
    var distancia = this.entity.getPosition().distance(this.otroObjeto.getPosition());
    
    // Si choca por primera vez
    if (distancia < this.distanciaColision && !this.enColision) {
        this.enColision = true;
        console.log("¡CHOQUE! Box rebota");
        
        // Calcular dirección del rebote
        this.calcularRebote();
        
        // Cambiar colores
        this.cambiarColor(1, 0, 0); // Box rojo
        this.cambiarColorOtro(1, 0, 0); // box2 rojo
        
        // Efecto de impacto
        this.efectoImpacto();
    }
    
    // Si se alejó, volver a normal
    if (distancia >= this.distanciaColision && this.enColision) {
        this.enColision = false;
        console.log("Se separaron");
        this.cambiarColor(0.7, 0.7, 0.7);
        this.cambiarColorOtro(0.7, 0.7, 0.7);
    }
};

// Calcular dirección del rebote
Movimiento.prototype.calcularRebote = function() {
    var posBox = this.entity.getPosition();
    var posBox2 = this.otroObjeto.getPosition();
    
    this.direccionRebote.x = posBox.x - posBox2.x;
    this.direccionRebote.z = posBox.z - posBox2.z;
    
    // Normalizar la dirección
    this.direccionRebote.normalize();
    
    // Activar el rebote
    this.tiempoRebote = this.duracionRebote;
    
    console.log("Rebotando en dirección:", this.direccionRebote.x, this.direccionRebote.z);
};

// Efecto de impacto en box2
Movimiento.prototype.efectoImpacto = function() {
    if (!this.otroObjeto) return;
    
    // Hacer que box2 "tiemble" un poco
    var posOriginal = this.otroObjeto.getPosition().clone();
    
    // Pequeño movimiento
    this.otroObjeto.translate(0.1, 0, 0);
    
    // Volver a la posición original después de un momento
    var self = this;
    setTimeout(function() {
        self.otroObjeto.setPosition(posOriginal);
    }, 100);
};

// Cambiar color de Box
Movimiento.prototype.cambiarColor = function(r, g, b) {
    var material = this.entity.render.meshInstances[0].material;
    material.diffuse.set(r, g, b);
    material.update();
};

// Cambiar color de box2
Movimiento.prototype.cambiarColorOtro = function(r, g, b) {
    if (!this.otroObjeto) return;
    var material = this.otroObjeto.render.meshInstances[0].material;
    material.diffuse.set(r, g, b);
    material.update();
};