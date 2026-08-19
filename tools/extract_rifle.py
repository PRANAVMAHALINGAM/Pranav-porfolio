"""Extract the CZ Bren from operator_posed.glb into a standalone czbren2.glb.

operator-scene drops a weapon model straight into its block-out rifle's
transform, so the export has to match the convention its constants were tuned
for, measured in the loaded glTF:

    WEAPON_SRC_LEN   = 4.627   overall length along +Z
    WEAPON_MUZZLE_Z  = 2.298   muzzle tip at +Z
    origin           = rifle centre, +Z down the barrel, +Y up

The glTF exporter converts Blender Z-up to glTF Y-up (gx, gy, gz) =
(bx, bz, -by), so inside Blender we aim the barrel down -Y and the sights up +Z.

Run: blender --background --python extract_rifle.py -- <in.glb> <out.glb> [flip]
"""
import bpy, sys
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index('--') + 1:]
SRC, DST = argv[0], argv[1]
FLIP_UP = 'flip' in argv[2:]
RENDER = next((a.split('=', 1)[1] for a in argv[2:] if a.startswith('render=')), None)

SRC_LEN = 4.627
MUZZLE_Z = 2.298

# operator-scene picks materials by name prefix: glass* -> emissive lens,
# grip|stock|mag* -> dark polymer, ironsight|bolt* -> steel, else metal.
RENAME = {
    'wpnLens': 'glass_lens',
    'wpnPolymer': 'grip_polymer',
    'wpnSteel': 'ironsight_steel',
    'wpnMetal': 'metal_body',
}


def log(*a):
    print('[extract]', *a)


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

rifle = bpy.data.objects.get('CZ_Bren')
muzzle = bpy.data.objects.get('MUZZLE')
if rifle is None:
    raise SystemExit('CZ_Bren not found')

bpy.context.view_layer.update()
muzzle_world = muzzle.matrix_world.translation.copy() if muzzle else None

mw = rifle.matrix_world.copy()
rifle.parent = None
rifle.matrix_world = mw
for m in list(rifle.modifiers):
    rifle.modifiers.remove(m)
for ob in list(bpy.data.objects):
    if ob is not rifle:
        bpy.data.objects.remove(ob, do_unlink=True)

bpy.context.view_layer.objects.active = rifle
rifle.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.context.view_layer.update()


def bounds():
    vs = [v.co for v in rifle.data.vertices]
    lo = Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs)))
    hi = Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
    return lo, hi


lo, hi = bounds()
centre = (lo + hi) / 2
size = hi - lo
log('source bbox', tuple(round(v, 4) for v in size))

fwd = (muzzle_world - centre).normalized()

# Up is the axis perpendicular to the barrel with the greatest extent (a rifle
# is taller through the magazine and sights than it is thick). Sign is the
# coin-flip the render settles.
perp = []
for i in range(3):
    a = Vector((0, 0, 0)); a[i] = 1.0
    a -= fwd * a.dot(fwd)
    perp.append((a.length * size[i], a.normalized()))
perp.sort(key=lambda p: -p[0])
up = perp[0][1]
if FLIP_UP:
    up = -up
log('forward', tuple(round(v, 3) for v in fwd), '| up', tuple(round(v, 3) for v in up))

# Build the rotation that sends forward -> -Y and up -> +Z.
side = fwd.cross(up).normalized()
up = side.cross(fwd).normalized()
# Send the rifle's own frame onto (-X, -Y, +Z): barrel down -Y so the exporter's
# Z-up -> Y-up flip puts it on glTF +Z, sights up +Z so they end up glTF +Y.
# side must go to -X, not +X, or the mapping is a reflection and mirrors the mesh.
src = Matrix((side, fwd, up)).transposed()          # columns: side, fwd, up
dst = Matrix(((-1, 0, 0), (0, -1, 0), (0, 0, 1)))   # side->-X, fwd->-Y, up->+Z
rot = (dst @ src.inverted()).to_4x4()
assert abs(rot.to_3x3().determinant() - 1.0) < 1e-6, 'not a rotation'

rifle.data.transform(Matrix.Translation(-centre))
rifle.data.transform(rot)

lo, hi = bounds()
length = hi.y - lo.y                                 # barrel now runs along Y
rifle.data.transform(Matrix.Diagonal((SRC_LEN / length,) * 3 + (1.0,)))
lo, hi = bounds()
# Muzzle sits at -Y in Blender, which the exporter turns into +Z in glTF.
rifle.data.transform(Matrix.Translation(Vector((0, -MUZZLE_Z - lo.y, 0))))

lo, hi = bounds()
log('FINAL blender  y: %.4f .. %.4f (len %.4f)  z: %.4f .. %.4f' % (lo.y, hi.y, hi.y - lo.y, lo.z, hi.z))
log('=> glTF        z: %.4f .. %.4f  muzzle %.4f' % (-hi.y, -lo.y, -lo.y))

for slot in rifle.material_slots:
    if slot.material and slot.material.name in RENAME:
        slot.material.name = RENAME[slot.material.name]

rifle.name = 'czbren'

if RENDER:
    scn = bpy.context.scene
    scn.render.engine = 'BLENDER_EEVEE'
    scn.render.resolution_x, scn.render.resolution_y = 900, 420
    scn.render.film_transparent = False
    world = bpy.data.worlds.new('w'); scn.world = world
    world.use_nodes = True
    world.node_tree.nodes['Background'].inputs[0].default_value = (0.05, 0.05, 0.06, 1)
    world.node_tree.nodes['Background'].inputs[1].default_value = 1.2

    light_data = bpy.data.lights.new('key', type='SUN')
    light_data.energy = 4
    light = bpy.data.objects.new('key', light_data)
    light.rotation_euler = (0.9, 0.2, 0.6)
    scn.collection.objects.link(light)

    cam_data = bpy.data.cameras.new('cam')
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = 5.6
    cam = bpy.data.objects.new('cam', cam_data)
    # Look down +X at the rifle's side: barrel across the frame, up is world +Z.
    cam.location = (9, 0, 0)
    cam.rotation_euler = (1.5708, 0, 1.5708)
    scn.collection.objects.link(cam)
    scn.camera = cam
    scn.render.filepath = RENDER
    bpy.ops.render.render(write_still=True)
    log('rendered', RENDER)

bpy.ops.export_scene.gltf(filepath=DST, export_format='GLB', use_selection=False,
                          export_yup=True, export_apply=True)
log('exported', DST)
