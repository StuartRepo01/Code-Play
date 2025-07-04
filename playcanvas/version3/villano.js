var Villano = pc.createScript('villano');

Villano.prototype.initialize = function() {
    // Referencias
    this.jugador = null;
    this.proyectiles = [];
    
    // ⭐ NUEVO: Referencia al MenuManager
    this.menuManager = null;
    
    // Configuración de disparo
    this.rangoDeteccion = 8;
    this.tiempoEntreDisparos = 1.5;
    this.tiempoUltimoDisparo = 0;
    this.velocidadProyectil = 6;
    
    // Buscar jugador y MenuManager
    setTimeout(() => {
        this.jugador = this.app.root.findByName('Box');
        
        // Buscar MenuManager
        var gameManager = this.app.root.findByName('GameManager');
        if (gameManager && gameManager.script && gameManager.script.menuManager) {
            this.menuManager = gameManager.script.menuManager;
            console.log("✅ Villano conectado con MenuManager");
        }
        
        console.log("Villano encontró jugador:", this.jugador ? "SÍ" : "NO");
    }, 200);
    
    // Material original del villano
    this.colorNormal = new pc.Color(0.3, 0.3, 0.8);
    this.colorAtacando = new pc.Color(0.8, 0.2, 0.2);
    
    this.cambiarColorVillano(this.colorNormal);
};

Villano.prototype.update = function(dt) {
    // ⭐ SOLO actuar si el juego está activo
    if (!this.menuManager || !this.menuManager.juegoActivo()) {
        return;
    }
    
    if (!this.jugador) return;
    
    // Calcular distancia al jugador
    var distancia = this.entity.getPosition().distance(this.jugador.getPosition());
    
    // Si el jugador está en rango
    if (distancia <= this.rangoDeteccion) {
        this.modoAtaque(dt);
    } else {
        this.modoNormal();
    }
    
    // Actualizar proyectiles
    this.actualizarProyectiles(dt);
};

// Modo de ataque: disparar proyectiles
Villano.prototype.modoAtaque = function(dt) {
    this.cambiarColorVillano(this.colorAtacando);
    this.tiempoUltimoDisparo += dt;
    
    if (this.tiempoUltimoDisparo >= this.tiempoEntreDisparos) {
        this.dispararProyectil();
        this.tiempoUltimoDisparo = 0;
    }
};

// Modo normal: sin atacar
Villano.prototype.modoNormal = function() {
    this.cambiarColorVillano(this.colorNormal);
};

// Crear y lanzar un proyectil
Villano.prototype.dispararProyectil = function() {
    console.log("💥 ¡Villano dispara!");
    
    var proyectil = new pc.Entity('Proyectil');
    proyectil.addComponent('render', {
        type: 'sphere'
    });
    
    proyectil.setLocalScale(0.2, 0.2, 0.2);
    
    var material = new pc.StandardMaterial();
    material.diffuse.set(1, 0.3, 0.3);
    material.emissive.set(0.2, 0, 0);
    material.update();
    proyectil.render.meshInstances[0].material = material;
    
    var posVillano = this.entity.getPosition();
    proyectil.setPosition(posVillano.x, posVillano.y + 0.5, posVillano.z);
    
    var posJugador = this.jugador.getPosition();
    var direccion = new pc.Vec3();
    direccion.x = posJugador.x - posVillano.x;
    direccion.z = posJugador.z - posVillano.z;
    direccion.normalize();
    
    this.app.root.addChild(proyectil);
    
    var datosProyectil = {
        entidad: proyectil,
        direccion: direccion,
        tiempoVida: 5,
        velocidad: this.velocidadProyectil
    };
    
    this.proyectiles.push(datosProyectil);
};

// Actualizar todos los proyectiles
Villano.prototype.actualizarProyectiles = function(dt) {
    for (var i = this.proyectiles.length - 1; i >= 0; i--) {
        var proj = this.proyectiles[i];
        
        proj.entidad.translate(
            proj.direccion.x * proj.velocidad * dt,
            0,
            proj.direccion.z * proj.velocidad * dt
        );
        
        proj.tiempoVida -= dt;
        
        var distanciaAJugador = proj.entidad.getPosition().distance(this.jugador.getPosition());
        
        if (distanciaAJugador < 0.8) {
            this.impactoEnJugador(proj);
            this.destruirProyectil(i);
        } else if (proj.tiempoVida <= 0) {
            this.destruirProyectil(i);
        }
    }
};

// Efecto cuando el proyectil impacta al jugador
Villano.prototype.impactoEnJugador = function(proyectil) {
    console.log("💥 ¡Proyectil impactó al jugador!");
    
    // ⭐ Causar daño al jugador a través de su script
    if (this.jugador && this.jugador.script && this.jugador.script.movimiento) {
        this.jugador.script.movimiento.recibirDano(15); // 15 puntos de daño
    }
    
    var materialJugador = this.jugador.render.meshInstances[0].material;
    materialJugador.diffuse.set(1, 0, 0);
    materialJugador.update();
    
    setTimeout(() => {
        materialJugador.diffuse.set(0.7, 0.7, 0.7);
        materialJugador.update();
    }, 500);
    
    var direccionEmpuje = new pc.Vec3();
    direccionEmpuje.copy(proyectil.direccion);
    direccionEmpuje.scale(2);
    
    var posJugador = this.jugador.getPosition();
    this.jugador.setPosition(
        posJugador.x + direccionEmpuje.x,
        posJugador.y,
        posJugador.z + direccionEmpuje.z
    );
};

// ⭐ NUEVA: Destruir todos los proyectiles (para reiniciar)
Villano.prototype.destruirTodosProyectiles = function() {
    for (var i = 0; i < this.proyectiles.length; i++) {
        this.proyectiles[i].entidad.destroy();
    }
    this.proyectiles = [];
    console.log("🧹 Proyectiles limpiados");
};

// Destruir un proyectil
Villano.prototype.destruirProyectil = function(indice) {
    var proyectil = this.proyectiles[indice];
    proyectil.entidad.destroy();
    this.proyectiles.splice(indice, 1);
};

// Cambiar color del villano
Villano.prototype.cambiarColorVillano = function(color) {
    var material = this.entity.render.meshInstances[0].material;
    material.diffuse.copy(color);
    material.update();
};