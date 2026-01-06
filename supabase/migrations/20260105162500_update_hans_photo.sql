-- Update the photo_url for Hans Beeckman to use the local image
UPDATE authors
SET photo_url = '/images/hans-blog.jpg'
WHERE id = 'hans-beeckman' OR name = 'Hans Beeckman';
