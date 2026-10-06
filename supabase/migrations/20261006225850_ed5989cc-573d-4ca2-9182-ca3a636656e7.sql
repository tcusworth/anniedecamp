create table public.merch_products (
 id uuid primary key default gen_random_uuid(),
 printify_product_id text not null,
 printify_variant_id integer not null,
 title text not null,
 variant_label text,
 category text not null,
 price_cents integer not null,
 image_url text not null,
 sort_order integer not null default 0,
 active boolean not null default true,
 created_at timestamptz not null default now(),
 unique (printify_product_id, printify_variant_id)
);
grant select on public.merch_products to anon, authenticated;
grant all on public.merch_products to service_role;
alter table public.merch_products enable row level security;
create policy "Merchandise is publicly viewable" on public.merch_products for select to anon, authenticated using (active = true);
alter table public.orders add column if not exists merch_product_id uuid references public.merch_products(id);
insert into public.merch_products (printify_product_id, printify_variant_id, title, variant_label, category, price_cents, image_url, sort_order) values
('6ac41182b9da022d150ea2e9',100848,'Portrait with Yellow Hat Scarf',null,'scarf',7500,'https://images-api.printify.com/mockup/6ac41182b9da022d150ea2e9/100848/93994/portrait-with-yellow-hat-scarf-repeating-art-illustration-lightweight-woven-scarf.jpg?camera_label=flat',0),
('6ac4104cbf107cc2c102b491',100848,'Vintage Floral Vase Scarf',null,'scarf',7500,'https://images-api.printify.com/mockup/6ac4104cbf107cc2c102b491/100848/93994/vintage-floral-vase-scarf-rectangular-floral-print-black-background.jpg?camera_label=flat',1),
('6ac40f22890565191d021115',100848,'Man in Green Scarf',null,'scarf',7500,'https://images-api.printify.com/mockup/6ac40f22890565191d021115/100848/93994/man-in-green-scarf-woven-fringe.jpg?camera_label=flat',2),
('6ac40e657d4f48c8fc0ce22c',100848,'Man in Pink Scarf',null,'scarf',7500,'https://images-api.printify.com/mockup/6ac40e657d4f48c8fc0ce22c/100848/93994/man-in-pink-lightweight-knit-scarf.jpg?camera_label=flat',3),
('6abeb946390b8e603a061f0f',103599,'Woman in Yellow Hat Tote Bag','Black','tote',4500,'https://images-api.printify.com/mockup/6abeb946390b8e603a061f0f/103599/100877/woman-in-yellow-hat-portrait-tote-bag-art-print-painterly-portrait.jpg?camera_label=front',4),
('6abeb946390b8e603a061f0f',103602,'Woman in Yellow Hat Tote Bag','Red','tote',4500,'https://images-api.printify.com/mockup/6abeb946390b8e603a061f0f/103599/100877/woman-in-yellow-hat-portrait-tote-bag-art-print-painterly-portrait.jpg?camera_label=front',5),
('6abeb946390b8e603a061f0f',103605,'Woman in Yellow Hat Tote Bag','White','tote',4500,'https://images-api.printify.com/mockup/6abeb946390b8e603a061f0f/103599/100877/woman-in-yellow-hat-portrait-tote-bag-art-print-painterly-portrait.jpg?camera_label=front',6),
('6abeb946390b8e603a061f0f',103608,'Woman in Yellow Hat Tote Bag','Beige','tote',4500,'https://images-api.printify.com/mockup/6abeb946390b8e603a061f0f/103599/100877/woman-in-yellow-hat-portrait-tote-bag-art-print-painterly-portrait.jpg?camera_label=front',7),
('6abeb946390b8e603a061f0f',103611,'Woman in Yellow Hat Tote Bag','Navy','tote',4500,'https://images-api.printify.com/mockup/6abeb946390b8e603a061f0f/103599/100877/woman-in-yellow-hat-portrait-tote-bag-art-print-painterly-portrait.jpg?camera_label=front',8),
('6abeb8bf4ae9e0138203515e',103599,'Tote Bag','Black','tote',4500,'https://images-api.printify.com/mockup/6abeb8bf4ae9e0138203515e/103599/100877/tote-bag-aop.jpg?camera_label=front',9),
('6abeb8bf4ae9e0138203515e',103602,'Tote Bag','Red','tote',4500,'https://images-api.printify.com/mockup/6abeb8bf4ae9e0138203515e/103599/100877/tote-bag-aop.jpg?camera_label=front',10),
('6abeb8bf4ae9e0138203515e',103605,'Tote Bag','White','tote',4500,'https://images-api.printify.com/mockup/6abeb8bf4ae9e0138203515e/103599/100877/tote-bag-aop.jpg?camera_label=front',11),
('6abeb8bf4ae9e0138203515e',103608,'Tote Bag','Beige','tote',4500,'https://images-api.printify.com/mockup/6abeb8bf4ae9e0138203515e/103599/100877/tote-bag-aop.jpg?camera_label=front',12),
('6abeb8bf4ae9e0138203515e',103611,'Tote Bag','Navy','tote',4500,'https://images-api.printify.com/mockup/6abeb8bf4ae9e0138203515e/103599/100877/tote-bag-aop.jpg?camera_label=front',13),
('6abeb7b56f80da533003c06a',91850,'Modern Cowgirl Notebook',null,'notebook',2800,'https://images-api.printify.com/mockup/6abeb7b56f80da533003c06a/91850/61060/modern-cowgirl-softcover-notebook-a5-art-journal-portrait-illustration.jpg?camera_label=front',14),
('6abeb707e03b4feed508ae49',91850,'Seize the Day Notebook',null,'notebook',2800,'https://images-api.printify.com/mockup/6abeb707e03b4feed508ae49/91850/61060/seize-the-day-notebook.jpg?camera_label=front',15),
('6abeb646e03b4feed508ae18',91850,'Poppies with Ginori Vase Notebook',null,'notebook',2800,'https://images-api.printify.com/mockup/6abeb646e03b4feed508ae18/91850/61060/poppies-with-ginori-vase-softcover-notebook-a5-art-journal.jpg?camera_label=front',16),
('6abeb446a9b26036df00d0cf',91850,'Floating Dutch Girl Notebook',null,'notebook',2800,'https://images-api.printify.com/mockup/6abeb446a9b26036df00d0cf/91850/61218/floating-dutch-girl-notebook-a5-softcover-sketch-journal.jpg?camera_label=open',17),
('6abeb3e07965c6c0ca03ca7f',91850,'Man with Quilt in Green Notebook',null,'notebook',2800,'https://images-api.printify.com/mockup/6abeb3e07965c6c0ca03ca7f/91850/61060/man-with-quilt-in-green-notebook-a5-illustrated-softcover-journal.jpg?camera_label=front',18),
('6abeb37ce03b4feed508acdb',91850,'Modern Cowgirl with Squash Blossom Notebook',null,'notebook',2800,'https://images-api.printify.com/mockup/6abeb37ce03b4feed508acdb/91850/61060/modern-cowgirl-with-squash-blossom-softcover-notebook-illustrated-portrait-a5-journal.jpg?camera_label=front',19),
('6abeb2df77f9a77d1c0e5d36',91850,'''Time'' Notebook',null,'notebook',2800,'https://images-api.printify.com/mockup/6abeb2df77f9a77d1c0e5d36/91850/61060/time-notebook.jpg?camera_label=front',20),
('6abeb206475363512d0c0fa5',91850,'Softcover Notebook',null,'notebook',2800,'https://images-api.printify.com/mockup/6abeb206475363512d0c0fa5/91850/61060/softcover-notebook-a5.jpg?camera_label=front',21);