import { useState } from 'react'
import { ChevronRight, Clock, ArrowLeft, PawPrint, Heart, Share2, Bookmark } from 'lucide-react'

interface BlogPost {
  slug: string
  category: string
  categoryColor: string
  title: string
  excerpt: string
  image: string
  readTime: string
  date: string
  keywords: string[]
  content?: string
}

const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'cat-warning-signs',
    category: 'Cat Health',
    categoryColor: 'text-orange-600 bg-orange-50',
    title: '7 Warning Signs Your Cat May Be Sick',
    excerpt: 'Cats are masters at hiding pain. Learn the subtle behavioral changes that could indicate your feline friend needs veterinary attention — from hiding and excessive grooming to appetite shifts.',
    image: './imgs/fluffy-tabby-kitten-pink-collar-portrait.jpg',
    readTime: '6 min',
    date: 'Mar 28, 2025',
    keywords: ['cat health', 'sick cat symptoms', 'cat behavior changes', 'cat illness', 'feline health', 'when to take cat to vet', 'cat hiding behavior'],
    content: `<h2 class="text-2xl font-bold text-gray-900 mb-4">1. Sudden Hiding or Withdrawal</h2>
<p class="text-gray-600 mb-6 leading-relaxed">Cats instinctively hide when they feel vulnerable. If your normally social cat suddenly retreats under the bed, behind furniture, or into closets for extended periods, it may be experiencing pain or discomfort. This is especially concerning if the hiding lasts more than 24 hours.</p>
<div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl mb-6">
<p class="text-blue-800 text-sm"><strong>Vet Tip:</strong> Track how long your cat hides. If it exceeds a day, schedule a vet visit — early detection significantly improves treatment outcomes.</p>
</div>
<h2 class="text-2xl font-bold text-gray-900 mb-4">2. Changes in Appetite or Thirst</h2>
<p class="text-gray-600 mb-6 leading-relaxed">Both increased and decreased appetite can signal illness. A cat that stops eating for 24-48 hours risks developing hepatic lipidosis (fatty liver disease), which can be life-threatening. Conversely, excessive thirst and urination may indicate diabetes or kidney disease.</p>
<h2 class="text-2xl font-bold text-gray-900 mb-4">3. Litter Box Problems</h2>
<p class="text-gray-600 mb-6 leading-relaxed">Urinating outside the litter box, straining to urinate, or blood in the urine are red flags for urinary tract infections (UTIs), bladder stones, or feline lower urinary tract disease (FLUTD). Male cats are particularly at risk for urinary blockages, which require emergency treatment.</p>
<h2 class="text-2xl font-bold text-gray-900 mb-4">4. Excessive Grooming or Coat Changes</h2>
<p class="text-gray-600 mb-6 leading-relaxed">While cats are meticulous groomers, excessive licking — especially of one area — can indicate allergies, parasites, or pain. A dull, matted, or thinning coat may signal nutritional deficiencies, thyroid issues, or stress.</p>
<h2 class="text-2xl font-bold text-gray-900 mb-4">5. Vomiting or Diarrhea</h2>
<p class="text-gray-600 mb-6 leading-relaxed">Occasional hairball vomiting is normal, but frequent vomiting, vomiting blood, or diarrhea lasting more than 24 hours warrants a vet visit. Chronic digestive issues can indicate inflammatory bowel disease (IBD), food allergies, or intestinal parasites.</p>
<h2 class="text-2xl font-bold text-gray-900 mb-4">6. Behavioral Changes: Aggression or Lethargy</h2>
<p class="text-gray-600 mb-6 leading-relaxed">A normally gentle cat that becomes aggressive when touched may be in pain. Similarly, a playful cat that becomes unusually lethargic, stops jumping, or sleeps significantly more could be dealing with an underlying health condition like arthritis or an infection.</p>
<h2 class="text-2xl font-bold text-gray-900 mb-4">7. Respiratory Changes</h2>
<p class="text-gray-600 mb-6 leading-relaxed">Open-mouth breathing, wheezing, coughing, or nasal discharge are never normal in cats. These symptoms can indicate upper respiratory infections, asthma, or even heart disease. Seek immediate veterinary care if you notice any breathing difficulty.</p>
<div class="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
<h3 class="text-lg font-bold text-gray-900 mb-3">When to Use HealiPet</h3>
<p class="text-gray-600 text-sm mb-3">If you notice any of these signs, upload a photo to HealiPet for an initial AI health assessment. Our vet-trained AI can analyze your cat's coat condition, eye clarity, and overall appearance to help you decide if a vet visit is needed.</p>
<a href="/" class="text-teal-600 font-medium text-sm hover:text-teal-700">→ Try HealiPet Free AI Health Check</a>
</div>`
  },
  {
    slug: 'best-dog-food-2025',
    category: 'Dog Nutrition',
    categoryColor: 'text-blue-600 bg-blue-50',
    title: 'Best Dog Food Brands 2025: A Vet-Approved Buying Guide',
    excerpt: 'Choosing the right food is the most important decision you make for your dog\'s health. We break down the best dry, wet, grain-free, and raw diet options for every life stage.',
    image: './imgs/happy-golden-retriever-laughing-deck.jpg',
    readTime: '10 min',
    date: 'Mar 25, 2025',
    keywords: ['best dog food 2025', 'dog food brands', 'grain free dog food', 'raw diet dogs', 'puppy food', 'senior dog food', 'dog nutrition', 'hypoallergenic dog food', 'organic dog food'],
    content: `<h2 class="text-2xl font-bold text-gray-900 mb-4">What Makes a Dog Food "Good"?</h2>
<p class="text-gray-600 mb-6 leading-relaxed">The best dog food meets AAFCO (Association of American Feed Control Officials) standards, lists a high-quality animal protein as the first ingredient, and is appropriate for your dog's life stage. Here's what to look for:</p>
<ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
<li><strong>Real meat</strong> (chicken, beef, lamb, fish) as the first ingredient</li>
<li>No artificial preservatives (BHA, BHT, ethoxyquin)</li>
<li>No unnamed meat by-products</li>
<li>Adequate omega-3 and omega-6 fatty acids for coat health</li>
<li>Added glucosamine and chondroitin for joint support (especially for large breeds)</li>
</ul>
<h2 class="text-2xl font-bold text-gray-900 mb-4">Top Picks by Category</h2>
<h3 class="text-xl font-bold text-gray-800 mb-3">🏆 Best Overall: The Farmer's Dog</h3>
<p class="text-gray-600 mb-6 leading-relaxed">Fresh, human-grade food customized to your dog's profile. While pricier than kibble, the quality difference is immediately visible in coat shine, energy levels, and stool quality. Ideal for dogs with food sensitivities.</p>
<h3 class="text-xl font-bold text-gray-800 mb-3">💪 Best for Active Dogs: Purina Pro Plan Sport</h3>
<p class="text-gray-600 mb-6 leading-relaxed">High-protein formula with 30% crude protein from real chicken. Includes live probiotics for digestive health and enhanced amino acid profile for muscle maintenance. Excellent value for performance-minded pet parents.</p>
<h3 class="text-xl font-bold text-gray-800 mb-3">🥇 Best Grain-Free: Wellness CORE</h3>
<p class="text-gray-600 mb-6 leading-relaxed">Deboned turkey, chicken meal, and turkey meal provide premium protein. Enriched with antioxidants, omega fatty acids, and glucosamine. Available in Original, Ocean, and Wild Game varieties.</p>
<h3 class="text-xl font-bold text-gray-800 mb-3">👶 Best Puppy Food: Royal Canin Breed-Specific</h3>
<p class="text-gray-600 mb-6 leading-relaxed">Tailored nutrition for specific breeds with appropriate calcium/phosphorus ratios for healthy bone development. Includes DHA for brain development and prebiotics for digestive support.</p>
<h3 class="text-xl font-bold text-gray-800 mb-3">👴 Best Senior Dog Food: Hill's Science Diet Senior</h3>
<p class="text-gray-600 mb-6 leading-relaxed">Formulated with easy-to-digest ingredients, controlled sodium levels, and added L-carnitine for lean muscle maintenance. Includes glucosamine for joint health and a clinically proven antioxidant blend.</p>
<div class="bg-teal-50 border border-teal-200 rounded-xl p-6 mb-6">
<h3 class="text-lg font-bold text-gray-900 mb-3">Feeding Tips for a Healthier Dog</h3>
<ul class="text-gray-600 text-sm space-y-2">
<li>• Transition foods gradually over 7-10 days to avoid digestive upset</li>
<li>• Measure portions — overfeeding is the #1 cause of canine obesity</li>
<li>• Add fresh toppings: blueberries, pumpkin, cooked sweet potato</li>
<li>• Always provide fresh water, especially with dry food diets</li>
<li>• Consider puzzle feeders to slow down fast eaters</li>
</ul>
</div>`
  },
  {
    slug: 'healthy-pet-treats',
    category: 'Pet Care',
    categoryColor: 'text-purple-600 bg-purple-50',
    title: 'Healthy Dog Treats & Cat Snacks Your Pet Will Actually Love',
    excerpt: 'Not all treats are created equal. Discover vet-recommended options that support dental health, joint mobility, and a shiny coat — plus which ingredients to avoid.',
    image: './imgs/golden-retriever-cuddling-grey-cat-friends.jpg',
    readTime: '8 min',
    date: 'Mar 22, 2025',
    keywords: ['healthy dog treats', 'cat snacks', 'dental chews dogs', 'organic pet treats', 'pet treat ingredients', 'best cat treats', 'dog training treats', 'hypoallergenic pet treats'],
    content: `<h2 class="text-2xl font-bold text-gray-900 mb-4">The Problem with Most Pet Treats</h2>
<p class="text-gray-600 mb-6 leading-relaxed">The average store-bought pet treat is loaded with fillers, artificial colors, excessive sugar, and low-quality protein. Treats should make up no more than 10% of your pet's daily caloric intake — so every treat should count nutritionally.</p>
<h2 class="text-2xl font-bold text-gray-900 mb-4">🦴 Best Dental Chews for Dogs</h2>
<p class="text-gray-600 mb-4 leading-relaxed">Dental disease affects 80% of dogs by age 3. These vet-recommended chews help reduce plaque and tartar:</p>
<ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
<li><strong>Greenies:</strong> VOHC-accepted, comes in multiple sizes. Texture designed to clean even hard-to-reach teeth.</li>
<li><strong>Whimzees:</strong> Plant-based, vegetarian option. Unique shapes help clean different tooth surfaces.</li>
<li><strong>Oravet:</strong> Contains delmopinol, a plaque-preventing ingredient also used in human dental products.</li>
</ul>
<h2 class="text-2xl font-bold text-gray-900 mb-4">🐟 Best Cat Treats for Health</h2>
<p class="text-gray-600 mb-6 leading-relaxed">Cats are obligate carnivores — their treats should be primarily protein-based. Look for:</p>
<ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
<li><strong>Freeze-dried salmon/tuna:</strong> Single ingredient, high protein, cats go wild for the aroma</li>
<li><strong>Lickable treats (Churu/Temptations Purée):</strong> Great for hydration, especially for cats that don't drink enough water</li>
<li><strong>Cat grass:</strong> Aids digestion and provides fiber. Easy to grow at home.</li>
</ul>
<h2 class="text-2xl font-bold text-gray-900 mb-4">⚠️ Ingredients to Avoid</h2>
<div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
<ul class="text-gray-700 text-sm space-y-2">
<li>❌ <strong>BHA, BHT, ethoxyquin</strong> — chemical preservatives linked to cancer</li>
<li>❌ <strong>Propylene glycol</strong> — toxic to cats, banned in cat food but still found in some treats</li>
<li>❌ <strong>Artificial colors</strong> (Red 40, Yellow 5, Blue 2) — unnecessary and potentially harmful</li>
<li>❌ <strong>Excess salt/sugar</strong> — contributes to obesity, diabetes, kidney strain</li>
<li>❌ <strong>Rawhide</strong> — choking hazard, difficult to digest, often treated with chemicals</li>
</ul>
</div>
<div class="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
<h3 class="text-lg font-bold text-gray-900 mb-3">DIY Pet Treats (Super Easy)</h3>
<p class="text-gray-600 text-sm mb-3"><strong>Dog Peanut Butter Bites:</strong> Mix 1 cup oats, ½ cup mashed banana, 2 tbsp unsweetened peanut butter (xylitol-free!). Roll into balls, refrigerate.</p>
<p class="text-gray-600 text-sm mb-3"><strong>Cat Salmon Crisps:</strong> Dehydrate thin salmon strips at 160°F for 4-6 hours. Break into small pieces.</p>
<p class="text-gray-600 text-sm"><strong>Sweet Potato Chews (both):</strong> Slice sweet potato ¼" thick, dehydrate at 160°F for 6-8 hours. Natural, single-ingredient, and pets love them.</p>
</div>`
  },
  {
    slug: 'dog-ear-infection-guide',
    category: 'Dog Health',
    categoryColor: 'text-red-600 bg-red-50',
    title: 'Dog Ear Infections: Causes, Symptoms & Treatment Guide',
    excerpt: 'Ear infections are one of the top reasons dogs visit the vet. Learn how to spot early signs, prevent recurrence, and when home remedies are safe to use.',
    image: './imgs/golden-retriever-puppy-sitting-red-collar.jpg',
    readTime: '7 min',
    date: 'Mar 18, 2025',
    keywords: ['dog ear infection', 'dog ear cleaning', 'ear infection symptoms dogs', 'dog ear mites', 'otitis externa dogs', 'dog ear drops', 'floppy ear dogs health'],
    content: `<h2 class="text-2xl font-bold text-gray-900 mb-4">Why Some Dogs Get More Ear Infections</h2>
<p class="text-gray-600 mb-6 leading-relaxed">Dogs with floppy ears (Cocker Spaniels, Golden Retrievers, Basset Hounds) are 3x more likely to develop ear infections because the ear canal stays warm and moist — the perfect environment for bacteria and yeast. Dogs that swim frequently are also at higher risk.</p>
<h2 class="text-2xl font-bold text-gray-900 mb-4">Early Warning Signs</h2>
<ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
<li>Head shaking or tilting</li>
<li>Scratching at ears or rubbing against furniture</li>
<li>Redness or swelling inside the ear</li>
<li>Dark discharge or unusual odor</li>
<li>Whimpering when ears are touched</li>
<li>Crusts or scabs on the inside of the ear flap</li>
</ul>
<h2 class="text-2xl font-bold text-gray-900 mb-4">Prevention Tips</h2>
<p class="text-gray-600 mb-4 leading-relaxed">Prevention is far easier than treatment. Follow this routine:</p>
<ol class="list-decimal list-inside text-gray-600 mb-6 space-y-2">
<li>Clean ears weekly with a vet-recommended ear cleaner</li>
<li>Dry ears thoroughly after swimming or bathing</li>
<li>Trim excess hair inside the ear canal (especially for floppy-eared breeds)</li>
<li>Check ears regularly for early signs of infection</li>
<li>Use a vet-recommended ear drying solution for dogs that swim often</li>
</ol>
<div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl mb-6">
<p class="text-blue-800 text-sm"><strong>Pro Tip:</strong> Never use cotton swabs inside your dog's ear canal — you can push debris deeper or damage the eardrum. Use a cotton ball or gauze wrapped around your finger instead.</p>
</div>`
  },
  {
    slug: 'cat-urinary-health',
    category: 'Cat Health',
    categoryColor: 'text-teal-600 bg-teal-50',
    title: 'Cat Urinary Health: Prevention, Diet & When to Worry',
    excerpt: 'FLUTD affects up to 3% of cats seen by vets. Learn which foods promote urinary health, what symptoms require emergency care, and how to prevent crystal formation.',
    image: './imgs/fluffy-tabby-kitten-pink-collar-portrait.jpg',
    readTime: '8 min',
    date: 'Mar 15, 2025',
    keywords: ['cat urinary health', 'cat UTI', 'feline lower urinary tract disease', 'cat urinary crystals', 'cat urinary diet', 'cat not peeing', 'cat bladder health'],
    content: `<h2 class="text-2xl font-bold text-gray-900 mb-4">Understanding FLUTD</h2>
<p class="text-gray-600 mb-6 leading-relaxed">Feline Lower Urinary Tract Disease (FLUTD) is a broad term covering conditions that affect the bladder and urethra. It includes urinary stones, urethral plugs, cystitis, and anatomical defects. Male cats are especially vulnerable because their urethra is narrow.</p>
<h2 class="text-2xl font-bold text-gray-900 mb-4">🚨 Emergency Signs (See Vet Immediately)</h2>
<div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
<ul class="text-gray-700 text-sm space-y-2">
<li>❌ Straining to urinate with no urine production</li>
<li>❌ Frequent trips to litter box with only drops</li>
<li>❌ Crying or vocalizing while in the litter box</li>
<li>❌ Blood in urine</li>
<li>❌ Licking genital area excessively</li>
<li>❌ Lethargy, vomiting, or hiding</li>
</ul>
</div>
<h2 class="text-2xl font-bold text-gray-900 mb-4">Diet for Urinary Health</h2>
<p class="text-gray-600 mb-6 leading-relaxed">The right diet is your strongest preventive tool:</p>
<ul class="list-disc list-inside text-gray-600 mb-6 space-y-2">
<li><strong>Wet food over dry:</strong> Increases moisture intake, which dilutes urine concentration</li>
<li><strong>Urinary health formulas:</strong> Royal Canin Urinary SO, Hill's c/d — designed to maintain proper urine pH</li>
<li><strong>Fresh water:</strong> Use a cat water fountain — cats prefer running water and drink more from fountains</li>
<li><strong>Avoid high-magnesium foods:</strong> Excess magnesium can contribute to struvite crystal formation</li>
</ul>`
  },
  {
    slug: 'dog-joint-supplements',
    category: 'Dog Wellness',
    categoryColor: 'text-indigo-600 bg-indigo-50',
    title: 'Dog Joint Supplements: What Actually Works in 2025',
    excerpt: 'Joint problems affect 1 in 4 dogs. We review the science behind glucosamine, chondroitin, green-lipped mussel, and omega-3s — and recommend products backed by clinical research.',
    image: './imgs/happy-golden-retriever-laughing-deck.jpg',
    readTime: '9 min',
    date: 'Mar 12, 2025',
    keywords: ['dog joint supplements', 'glucosamine dogs', 'dog arthritis treatment', 'green lipped mussel dogs', 'dog hip dysplasia', 'dog joint health', 'senior dog mobility'],
    content: `<h2 class="text-2xl font-bold text-gray-900 mb-4">Understanding Joint Disease in Dogs</h2>
<p class="text-gray-600 mb-6 leading-relaxed">Osteoarthritis affects approximately 20% of dogs over age 1 and 80% of dogs over age 8. Common signs include stiffness after rest, reluctance to climb stairs, decreased activity, and limping. Early intervention with the right supplements can significantly slow progression.</p>
<h2 class="text-2xl font-bold text-gray-900 mb-4">Evidence-Based Supplements</h2>
<h3 class="text-xl font-bold text-gray-800 mb-3">1. Glucosamine + Chondroitin</h3>
<p class="text-gray-600 mb-6 leading-relaxed">The most researched combination for joint health. Glucosamine provides building blocks for cartilage repair, while chondroitin blocks enzymes that break down cartilage. Studies show 70-80% of dogs show improvement within 4-6 weeks.</p>
<h3 class="text-xl font-bold text-gray-800 mb-3">2. Omega-3 Fatty Acids (EPA/DHA)</h3>
<p class="text-gray-600 mb-6 leading-relaxed">Fish oil supplements with high EPA/DHA content reduce inflammation and slow cartilage degradation. The recommended dose is approximately 75-100mg per kg of body weight of combined EPA and DHA.</p>
<h3 class="text-xl font-bold text-gray-800 mb-3">3. Green-Lipped Mussel (GLM)</h3>
<p class="text-gray-600 mb-6 leading-relaxed">Native to New Zealand, GLM contains a unique blend of omega-3s, glycosaminoglycans, and antioxidants. Multiple clinical trials show it can reduce joint pain and improve mobility, often working faster than traditional glucosamine supplements.</p>
<h3 class="text-xl font-bold text-gray-800 mb-3">4. Turmeric/Curcumin</h3>
<p class="text-gray-600 mb-6 leading-relaxed">Powerful anti-inflammatory properties, but curcumin has low bioavailability. Look for supplements with piperine (black pepper extract) or liposomal formulations for better absorption.</p>
<div class="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
<h3 class="text-lg font-bold text-gray-900 mb-3">Top Product Picks</h3>
<ul class="text-gray-600 text-sm space-y-2">
<li>🏆 <strong>Dasuquin Advanced:</strong> Glucosamine + chondroitin + ASU + curcumin. Most vet-recommended brand.</li>
<li>🐟 <strong>Nordic Naturals Omega-3 Pet:</strong> High-potency fish oil, third-party tested for purity.</li>
<li>🦪 <strong>Moxxor:</strong> Green-lipped mussel oil, highly bioavailable omega-3.</li>
</ul>
</div>`
  }
]

const CATEGORIES = ['All', 'Cat Health', 'Dog Health', 'Dog Nutrition', 'Pet Care', 'Dog Wellness']

export default function BlogPage({ onBack }: { onBack: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)

  const filteredPosts = selectedCategory === 'All'
    ? BLOG_POSTS
    : BLOG_POSTS.filter(p => p.category === selectedCategory)

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button onClick={() => setSelectedPost(null)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Blog</span>
            </button>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Bookmark className="w-5 h-5 text-gray-400" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Share2 className="w-5 h-5 text-gray-400" /></button>
            </div>
          </div>
        </header>

        {/* Article */}
        <article className="max-w-3xl mx-auto px-6 py-12">
          <div className="mb-8">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${selectedPost.categoryColor}`}>
              {selectedPost.category}
            </span>
            <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-4">{selectedPost.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {selectedPost.readTime} read
              </div>
              <span>{selectedPost.date}</span>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden mb-10 shadow-lg">
            <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-72 object-cover" />
          </div>

          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-900 prose-a:text-teal-600"
            dangerouslySetInnerHTML={{ __html: selectedPost.content || '' }}
          />

          {/* Internal Links / Related Posts */}
          <div className="mt-12 pt-10 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Related Articles</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {BLOG_POSTS.filter(p => p.slug !== selectedPost.slug).slice(0, 2).map(post => (
                <button
                  key={post.slug}
                  onClick={() => { setSelectedPost(post); window.scrollTo(0, 0); }}
                  className="text-left group"
                >
                  <div className="h-40 rounded-xl overflow-hidden mb-3">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <span className="text-xs font-semibold text-teal-600 uppercase">{post.category}</span>
                  <h4 className="font-bold text-gray-900 mt-1 group-hover:text-blue-600 transition-colors">{post.title}</h4>
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-8 text-center border border-blue-100">
            <PawPrint className="w-10 h-10 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Concerned About Your Pet's Health?</h3>
            <p className="text-gray-600 mb-6 text-sm">Upload a photo and get AI-powered health insights in seconds. It's free to start.</p>
            <a href="/" className="inline-flex items-center gap-2 btn-primary">
              <span>Try HealiPet Free</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </article>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Home</span>
          </button>
          <div className="flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-gray-900">HealiPet Blog</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-teal-600 to-emerald-500 px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Pet Health & Wellness Blog</h1>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          Expert guides on dog and cat health, nutrition, treats, supplements, and everyday care — written for pet parents who want the best.
        </p>
      </section>

      {/* Category Filter */}
      <section className="max-w-6xl mx-auto px-6 -mt-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Blog Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-sm text-gray-500 mb-8">{filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => (
            <button
              key={post.slug}
              onClick={() => { setSelectedPost(post); window.scrollTo(0, 0); }}
              className="group text-left bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-48 overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${post.categoryColor}`}>
                  {post.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-3 mb-2 group-hover:text-blue-600 transition-colors leading-snug">{post.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                  </div>
                  <span>{post.date}</span>
                </div>
                {/* Hidden SEO keywords for crawling */}
                <div className="hidden">{post.keywords.join(', ')}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-10 text-center">
          <Heart className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Stay Informed About Your Pet's Health</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">Get weekly pet health tips, nutrition guides, and product reviews delivered to your inbox.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="your@email.com" 
              className="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <button className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
