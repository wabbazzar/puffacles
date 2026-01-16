#!/usr/bin/env python3
"""
Create Queen Sprite Sheet for Puffy Queen game.
Generates a 192x192 (4x4 grid of 48x48 frames) sprite sheet.

Layout:
- Row 0 (frames 0-3): hover - idle floating, slow wing flap
- Row 1 (frames 4-7): flap_up - upward thrust, fast wing beat
- Row 2 (frames 8-11): fall - falling/gliding, wings up
- Row 3 (frames 12-15): dive - dive attack (placeholder)
"""

from PIL import Image, ImageDraw

# Sprite sheet dimensions
FRAME_SIZE = 48
GRID_SIZE = 4
SHEET_SIZE = FRAME_SIZE * GRID_SIZE  # 192x192

# Color palette (matching puffy style)
COLORS = {
    'transparent': (0, 0, 0, 0),
    'outline': (64, 48, 32, 255),        # Dark brown outline
    'orange_dark': (200, 120, 60, 255),  # Dark orange fur
    'orange_mid': (235, 160, 80, 255),   # Mid orange fur
    'orange_light': (250, 200, 130, 255),# Light orange fur
    'white': (255, 255, 255, 255),       # White chest/face
    'cream': (255, 245, 220, 255),       # Cream highlights
    'nose_pink': (255, 180, 180, 255),   # Pink nose
    'eye_green': (120, 200, 120, 255),   # Green eyes
    'eye_dark': (40, 80, 40, 255),       # Dark eye
    'crown_gold': (255, 215, 0, 255),    # Gold crown
    'crown_dark': (200, 160, 0, 255),    # Dark gold
    'wing_light': (200, 220, 255, 200),  # Light blue wing (semi-transparent)
    'wing_mid': (150, 180, 230, 220),    # Mid blue wing
    'wing_dark': (100, 130, 200, 255),   # Dark blue wing outline
}

def create_queen_frame(draw, x_offset, y_offset, wing_phase=0, body_phase=0):
    """Draw a single queen frame at the given offset."""
    cx = x_offset + 24  # Center x
    cy = y_offset + 26  # Center y (slightly lower for crown space)

    # Body bob based on phase
    body_y = cy + (body_phase * 1)

    # --- WINGS (behind body) ---
    draw_wings(draw, cx, body_y, wing_phase)

    # --- BODY ---
    draw_body(draw, cx, body_y)

    # --- CROWN ---
    draw_crown(draw, cx, body_y - 14)

def draw_wings(draw, cx, cy, wing_phase):
    """Draw fairy wings at different phases (0-3)."""
    # Wing positions based on phase (0=down, 1=mid-down, 2=up, 3=mid-up)
    wing_offsets = [
        (6, 2),   # Phase 0: wings down
        (7, 0),   # Phase 1: wings mid
        (8, -3),  # Phase 2: wings up
        (7, -1),  # Phase 3: wings mid-down
    ]

    wx, wy = wing_offsets[wing_phase % 4]

    # Left wing
    draw_single_wing(draw, cx - wx, cy + wy, flip=True, phase=wing_phase)
    # Right wing
    draw_single_wing(draw, cx + wx, cy + wy, flip=False, phase=wing_phase)

def draw_single_wing(draw, x, y, flip=False, phase=0):
    """Draw a single fairy wing."""
    # Wing shape varies by phase
    if phase in [0, 1]:  # Down/mid-down
        # Smaller, more folded wing
        points = [
            (x, y),
            (x + (4 if not flip else -4), y - 2),
            (x + (8 if not flip else -8), y + 2),
            (x + (6 if not flip else -6), y + 6),
            (x + (2 if not flip else -2), y + 4),
        ]
    else:  # Up/mid-up
        # Larger, extended wing
        points = [
            (x, y),
            (x + (5 if not flip else -5), y - 5),
            (x + (10 if not flip else -10), y - 2),
            (x + (8 if not flip else -8), y + 4),
            (x + (3 if not flip else -3), y + 5),
        ]

    # Fill wing
    draw.polygon(points, fill=COLORS['wing_light'])
    # Wing outline
    draw.line(points + [points[0]], fill=COLORS['wing_dark'], width=1)
    # Wing vein
    mid_x = x + (5 if not flip else -5)
    draw.line([(x, y), (mid_x, y + 1)], fill=COLORS['wing_mid'], width=1)

def draw_body(draw, cx, cy):
    """Draw the cat body."""
    # Main body (oval-ish)
    body_bbox = [cx - 10, cy - 8, cx + 10, cy + 10]
    draw.ellipse(body_bbox, fill=COLORS['orange_mid'], outline=COLORS['outline'])

    # Head (circle, overlapping body top)
    head_bbox = [cx - 9, cy - 14, cx + 9, cy + 2]
    draw.ellipse(head_bbox, fill=COLORS['orange_mid'], outline=COLORS['outline'])

    # Ears
    # Left ear
    draw.polygon([(cx - 8, cy - 12), (cx - 10, cy - 18), (cx - 4, cy - 14)],
                 fill=COLORS['orange_mid'], outline=COLORS['outline'])
    draw.polygon([(cx - 7, cy - 13), (cx - 9, cy - 16), (cx - 5, cy - 14)],
                 fill=COLORS['nose_pink'])
    # Right ear
    draw.polygon([(cx + 8, cy - 12), (cx + 10, cy - 18), (cx + 4, cy - 14)],
                 fill=COLORS['orange_mid'], outline=COLORS['outline'])
    draw.polygon([(cx + 7, cy - 13), (cx + 9, cy - 16), (cx + 5, cy - 14)],
                 fill=COLORS['nose_pink'])

    # Face markings - white muzzle area
    draw.ellipse([cx - 5, cy - 6, cx + 5, cy + 1], fill=COLORS['white'])

    # Eyes
    draw.ellipse([cx - 6, cy - 9, cx - 2, cy - 5], fill=COLORS['eye_green'], outline=COLORS['outline'])
    draw.ellipse([cx + 2, cy - 9, cx + 6, cy - 5], fill=COLORS['eye_green'], outline=COLORS['outline'])
    # Pupils
    draw.ellipse([cx - 5, cy - 8, cx - 3, cy - 6], fill=COLORS['eye_dark'])
    draw.ellipse([cx + 3, cy - 8, cx + 5, cy - 6], fill=COLORS['eye_dark'])

    # Nose
    draw.polygon([(cx, cy - 4), (cx - 2, cy - 2), (cx + 2, cy - 2)], fill=COLORS['nose_pink'])

    # Chest fluff
    draw.ellipse([cx - 6, cy + 2, cx + 6, cy + 9], fill=COLORS['cream'])

    # Front paws (tucked up for flying)
    draw.ellipse([cx - 7, cy + 6, cx - 2, cy + 11], fill=COLORS['orange_mid'], outline=COLORS['outline'])
    draw.ellipse([cx + 2, cy + 6, cx + 7, cy + 11], fill=COLORS['orange_mid'], outline=COLORS['outline'])

    # Tail (curved up behind)
    tail_points = [(cx + 8, cy + 4), (cx + 12, cy), (cx + 14, cy - 4), (cx + 12, cy - 2), (cx + 10, cy + 2), (cx + 8, cy + 5)]
    draw.polygon(tail_points, fill=COLORS['orange_mid'], outline=COLORS['outline'])

def draw_crown(draw, cx, y):
    """Draw a small crown on top of head."""
    # Crown base
    crown_y = y - 2
    draw.rectangle([cx - 5, crown_y, cx + 5, crown_y + 3], fill=COLORS['crown_gold'], outline=COLORS['crown_dark'])

    # Crown points (3 points)
    draw.polygon([(cx - 4, crown_y), (cx - 3, crown_y - 3), (cx - 2, crown_y)], fill=COLORS['crown_gold'], outline=COLORS['crown_dark'])
    draw.polygon([(cx - 1, crown_y), (cx, crown_y - 4), (cx + 1, crown_y)], fill=COLORS['crown_gold'], outline=COLORS['crown_dark'])
    draw.polygon([(cx + 2, crown_y), (cx + 3, crown_y - 3), (cx + 4, crown_y)], fill=COLORS['crown_gold'], outline=COLORS['crown_dark'])

def create_hover_row(img, row=0):
    """Row 0: Hover animation - slow wing flap, slight bob."""
    draw = ImageDraw.Draw(img)
    for frame in range(4):
        x = frame * FRAME_SIZE
        y = row * FRAME_SIZE
        # Slow wing cycle, slight body bob
        create_queen_frame(draw, x, y, wing_phase=frame, body_phase=frame % 2)

def create_flap_up_row(img, row=1):
    """Row 1: Flap up animation - fast wing beat, body rises."""
    draw = ImageDraw.Draw(img)
    for frame in range(4):
        x = frame * FRAME_SIZE
        y = row * FRAME_SIZE
        # Fast wing cycle (2x speed), body moves up
        create_queen_frame(draw, x, y, wing_phase=(frame * 2) % 4, body_phase=-frame)

def create_fall_row(img, row=2):
    """Row 2: Fall animation - wings up, body elongated down."""
    draw = ImageDraw.Draw(img)
    for frame in range(4):
        x = frame * FRAME_SIZE
        y = row * FRAME_SIZE
        # Wings stay up (phase 2-3), slight flutter
        create_queen_frame(draw, x, y, wing_phase=2 + (frame % 2), body_phase=1)

def create_dive_row(img, row=3):
    """Row 3: Dive animation - wings back, body angled down."""
    draw = ImageDraw.Draw(img)
    for frame in range(4):
        x = frame * FRAME_SIZE
        y = row * FRAME_SIZE
        # Wings folded (phase 0-1), body down
        create_queen_frame(draw, x, y, wing_phase=frame % 2, body_phase=2)

def main():
    # Create transparent image
    img = Image.new('RGBA', (SHEET_SIZE, SHEET_SIZE), COLORS['transparent'])

    # Create each animation row
    create_hover_row(img, row=0)
    create_flap_up_row(img, row=1)
    create_fall_row(img, row=2)
    create_dive_row(img, row=3)

    # Save the sprite sheet
    output_path = 'assets/queen_sprite_4x4.png'
    img.save(output_path, 'PNG')
    print(f"Created queen sprite sheet: {output_path}")
    print(f"Dimensions: {img.size[0]}x{img.size[1]}")
    print(f"Frame size: {FRAME_SIZE}x{FRAME_SIZE}")
    print(f"Layout: {GRID_SIZE}x{GRID_SIZE} grid")
    print("\nAnimation rows:")
    print("  Row 0 (0-3):   hover - idle floating")
    print("  Row 1 (4-7):   flap_up - upward thrust")
    print("  Row 2 (8-11):  fall - falling/gliding")
    print("  Row 3 (12-15): dive - dive attack")

if __name__ == '__main__':
    main()
