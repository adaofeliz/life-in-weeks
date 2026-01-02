"""
Your Life in Weeks API
Based on Tim Urban's "Your Life in Weeks" post from Wait But Why
Generates a visual representation of weeks lived vs weeks remaining until age 90
"""

from fastapi import FastAPI, Query, Response
from fastapi.responses import StreamingResponse
from datetime import date, datetime
from PIL import Image, ImageDraw
from io import BytesIO
from typing import Optional
import math

app = FastAPI(
    title="Your Life in Weeks API",
    description="Generate 'Your Life in Weeks' images based on Tim Urban's Wait But Why post",
    version="1.0.0"
)

# Constants
TOTAL_YEARS = 90
WEEKS_PER_YEAR = 52
TOTAL_WEEKS = TOTAL_YEARS * WEEKS_PER_YEAR  # 4680 weeks

def calculate_weeks_lived(birth_date: date) -> int:
    """Calculate the number of weeks lived since birth date."""
    today = date.today()
    days_lived = (today - birth_date).days
    weeks_lived = days_lived // 7
    return min(weeks_lived, TOTAL_WEEKS)  # Cap at total weeks

def generate_life_in_weeks_image(
    birth_date: date,
    width: int = 800,
    height: int = 1200,
    filled_color: str = "#2563eb",  # Blue for lived weeks
    empty_color: str = "#e5e7eb",   # Light gray for remaining weeks
    background_color: str = "#ffffff",  # White background
    border_color: str = "#374151"   # Dark gray border
) -> BytesIO:
    """
    Generate the Life in Weeks image.
    
    Grid layout: 52 columns (weeks per year) x 90 rows (years)
    """
    weeks_lived = calculate_weeks_lived(birth_date)
    
    # Calculate grid dimensions
    cols = WEEKS_PER_YEAR  # 52 weeks
    rows = TOTAL_YEARS     # 90 years
    
    # Calculate padding and cell sizes
    padding_x = int(width * 0.08)
    padding_y = int(height * 0.05)
    title_space = int(height * 0.06)
    
    available_width = width - (2 * padding_x)
    available_height = height - (2 * padding_y) - title_space
    
    # Calculate cell size (square cells with spacing)
    cell_width = available_width / cols
    cell_height = available_height / rows
    cell_size = min(cell_width, cell_height)
    
    # Leave some spacing between cells
    spacing_ratio = 0.15
    box_size = cell_size * (1 - spacing_ratio)
    spacing = cell_size * spacing_ratio
    
    # Create image
    img = Image.new('RGB', (width, height), background_color)
    draw = ImageDraw.Draw(img)
    
    # Calculate actual grid dimensions to center it
    grid_width = cols * cell_size
    grid_height = rows * cell_size
    
    start_x = (width - grid_width) / 2
    start_y = padding_y + title_space
    
    # Draw title
    try:
        from PIL import ImageFont
        # Try to use a system font
        font_size = int(height * 0.025)
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        font = None
    
    title = f"YOUR LIFE IN WEEKS"
    subtitle = f"Born: {birth_date.strftime('%B %d, %Y')} | Weeks lived: {weeks_lived:,} of {TOTAL_WEEKS:,}"
    
    # Draw title centered
    if font:
        title_bbox = draw.textbbox((0, 0), title, font=font)
        title_width = title_bbox[2] - title_bbox[0]
        draw.text(((width - title_width) / 2, padding_y / 2), title, fill=border_color, font=font)
        
        # Smaller font for subtitle
        small_font_size = int(height * 0.015)
        try:
            small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", small_font_size)
        except:
            small_font = None
        
        if small_font:
            sub_bbox = draw.textbbox((0, 0), subtitle, font=small_font)
            sub_width = sub_bbox[2] - sub_bbox[0]
            draw.text(((width - sub_width) / 2, padding_y / 2 + font_size + 5), subtitle, fill="#6b7280", font=small_font)
    
    # Draw the grid
    for year in range(rows):
        for week in range(cols):
            week_number = year * WEEKS_PER_YEAR + week
            
            x = start_x + (week * cell_size) + (spacing / 2)
            y = start_y + (year * cell_size) + (spacing / 2)
            
            # Determine if this week has been lived
            if week_number < weeks_lived:
                fill_color = filled_color
            else:
                fill_color = empty_color
            
            # Draw rounded rectangle (or regular rectangle for small sizes)
            if box_size > 4:
                radius = max(1, int(box_size * 0.2))
                draw.rounded_rectangle(
                    [x, y, x + box_size, y + box_size],
                    radius=radius,
                    fill=fill_color
                )
            else:
                draw.rectangle(
                    [x, y, x + box_size, y + box_size],
                    fill=fill_color
                )
    
    # Draw year markers on the left side (every 10 years)
    marker_font_size = int(height * 0.012)
    try:
        marker_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", marker_font_size)
    except:
        marker_font = None
    
    for year in range(0, TOTAL_YEARS + 1, 10):
        if year < TOTAL_YEARS:
            y = start_y + (year * cell_size)
            label = str(year)
            if marker_font:
                draw.text((5, y), label, fill="#9ca3af", font=marker_font)
    
    # Save to BytesIO
    output = BytesIO()
    img.save(output, format='PNG', optimize=True)
    output.seek(0)
    
    return output


@app.get("/")
async def root():
    """API welcome endpoint with usage instructions."""
    return {
        "message": "Welcome to the Your Life in Weeks API",
        "description": "Generate images visualizing your life in weeks (inspired by Tim Urban's Wait But Why post)",
        "usage": {
            "endpoint": "/life-in-weeks",
            "parameters": {
                "birth_date": "Your birth date in YYYY-MM-DD format (required)",
                "width": "Image width in pixels (default: 800)",
                "height": "Image height in pixels (default: 1200)",
                "filled_color": "Hex color for lived weeks (default: #2563eb)",
                "empty_color": "Hex color for remaining weeks (default: #e5e7eb)"
            },
            "example": "/life-in-weeks?birth_date=1990-05-15&width=800&height=1200"
        }
    }


@app.get("/life-in-weeks")
async def life_in_weeks(
    birth_date: str = Query(
        ...,
        description="Birth date in YYYY-MM-DD format",
        example="1990-01-15"
    ),
    width: int = Query(
        default=800,
        ge=200,
        le=4000,
        description="Image width in pixels"
    ),
    height: int = Query(
        default=1200,
        ge=300,
        le=6000,
        description="Image height in pixels"
    ),
    filled_color: str = Query(
        default="#2563eb",
        description="Hex color for weeks already lived"
    ),
    empty_color: str = Query(
        default="#e5e7eb",
        description="Hex color for remaining weeks"
    ),
    background_color: str = Query(
        default="#ffffff",
        description="Hex color for background"
    )
):
    """
    Generate a 'Your Life in Weeks' image.
    
    This endpoint creates a visual grid showing:
    - 52 columns (weeks per year)
    - 90 rows (years of life)
    - Filled squares for weeks already lived
    - Empty squares for weeks remaining
    
    Returns a PNG image.
    """
    try:
        # Parse the birth date
        parsed_date = datetime.strptime(birth_date, "%Y-%m-%d").date()
        
        # Validate birth date is in the past
        if parsed_date > date.today():
            return Response(
                content='{"error": "Birth date must be in the past"}',
                status_code=400,
                media_type="application/json"
            )
        
        # Validate birth date is reasonable (not more than 90 years ago for this visualization)
        years_ago = (date.today() - parsed_date).days / 365.25
        if years_ago > 90:
            return Response(
                content='{"error": "Birth date cannot be more than 90 years ago"}',
                status_code=400,
                media_type="application/json"
            )
        
        # Generate the image
        image_buffer = generate_life_in_weeks_image(
            birth_date=parsed_date,
            width=width,
            height=height,
            filled_color=filled_color,
            empty_color=empty_color,
            background_color=background_color
        )
        
        return StreamingResponse(
            image_buffer,
            media_type="image/png",
            headers={
                "Content-Disposition": f"inline; filename=life-in-weeks-{birth_date}.png"
            }
        )
        
    except ValueError as e:
        return Response(
            content='{"error": "Invalid date format. Use YYYY-MM-DD"}',
            status_code=400,
            media_type="application/json"
        )


@app.get("/stats")
async def get_stats(
    birth_date: str = Query(
        ...,
        description="Birth date in YYYY-MM-DD format",
        example="1990-01-15"
    )
):
    """
    Get statistics about weeks lived without generating an image.
    """
    try:
        parsed_date = datetime.strptime(birth_date, "%Y-%m-%d").date()
        
        if parsed_date > date.today():
            return Response(
                content='{"error": "Birth date must be in the past"}',
                status_code=400,
                media_type="application/json"
            )
        
        weeks_lived = calculate_weeks_lived(parsed_date)
        weeks_remaining = TOTAL_WEEKS - weeks_lived
        percentage_lived = (weeks_lived / TOTAL_WEEKS) * 100
        
        days_lived = (date.today() - parsed_date).days
        years_lived = days_lived / 365.25
        
        return {
            "birth_date": birth_date,
            "current_date": date.today().isoformat(),
            "total_weeks_in_90_years": TOTAL_WEEKS,
            "weeks_lived": weeks_lived,
            "weeks_remaining": max(0, weeks_remaining),
            "percentage_lived": round(percentage_lived, 2),
            "years_lived": round(years_lived, 2),
            "days_lived": days_lived,
            "days_remaining": max(0, (TOTAL_YEARS * 365) - days_lived)
        }
        
    except ValueError:
        return Response(
            content='{"error": "Invalid date format. Use YYYY-MM-DD"}',
            status_code=400,
            media_type="application/json"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
