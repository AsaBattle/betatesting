    import React, { useState } from 'react';
    import { useRouter } from 'next/router';

    function FastSAMComponent({ onSubmit }) {
    const [image_url, setImageUrl] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSubmit(image_url);
    };

    return (
        <form onSubmit={handleSubmit}>
        <label>
            Image URL:
            <input
            type="text"
            value={image_url}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter image URL"
            />
        </label>
        <button type="submit">Generate Mask Image</button>
        </form>
    );
    }
  
    function FSAMTestPage({ defaultImageUrl }) {
        const router = useRouter();
      
        const pollForResult = async (id) => {
          try {
            const statusResponse = await fetch(`/api/fsam/${id}`);
            const resultData = await statusResponse.json();
            console.log('resultData:', resultData);

            if (statusResponse.ok) {
              if (resultData.status === 'succeeded') {
                router.push({
                  pathname: '/fsamtest',
                  query: { image_url: resultData.output },
                });
              } else if (resultData.status === 'failed') {
                console.error('FastSAM processing failed.');
              } else {
                setTimeout(() => pollForResult(id), 1000); // Continue polling
              }
            } else {
              console.error('Error fetching the FastSAM result.');
            }
          } catch (error) {
            console.error('Error in pollForResult:', error);
          }
        };
      
        const handleSubmission = async (image_url) => {
          try {
            const fsamRequestBody = {
              iou: 0.9,
              conf: 0.4,
              retina: true,
              box_prompt: "[0,0,0,0]",
              image_size: 640,
              model_name: "FastSAM-x",
              input_image: image_url,
              point_label: "[0]",
              point_prompt: "[[0,0]]",
              withContours: true,
            };
      
            const initialResponse = await fetch('/api/fsam', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(fsamRequestBody),
            });
      
            const prediction = await initialResponse.json();
            if (initialResponse.ok) {
              pollForResult(prediction.id);
            } else {
              console.error(prediction.message || 'Something went wrong during the initial API call.');
            }
          } catch (error) {
            console.error('Error in handleSubmission:', error);
          }
        };
      
        const imageUrl = router.query.image_url || defaultImageUrl;
      
        return (
          <div>
            <h1>FastSAM Mask Image Generator</h1>
            <FastSAMComponent onSubmit={handleSubmission} />
            {imageUrl && (
              <div>
                <h2>Generated Mask Image:</h2>
                <img src={imageUrl} alt="Generated Mask" style={{ maxWidth: '100%' }} />
              </div>
            )}
          </div>
        );
      }
      
      export default FSAMTestPage;
      